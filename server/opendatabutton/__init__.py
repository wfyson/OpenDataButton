import os, uuid, sqlite3, time
from datetime import datetime
from flask import Flask, render_template, redirect, send_from_directory, request, json, jsonify, g

# Define Flask app
app = Flask(__name__)
DEBUG = True
DATABASE = '/tmp/opendatabutton.db'
SERVER_PORT = 7000

# Cache configuration
if 'REDISTOGO_URL' in os.environ: # cloud
	from werkzeug.contrib.cache import RedisCache
	REDISTOGO_PASS = os.environ['REDISTOGO_PASS']
	cache = RedisCache(host='cod.redistogo.com', port=9747, password=REDISTOGO_PASS, default_timeout=300, key_prefix=None)
	cache_type = "redistogo"
elif 'REDISLOCAL' in os.environ: # local
	from werkzeug.contrib.cache import RedisCache
	cache = RedisCache(host='localhost', port=16379, key_prefix='odb_')
	cache_type = "redisunix"
else: # instant
	from werkzeug.contrib.cache import SimpleCache
	cache = SimpleCache()
	cache_type = "local"

# Home page
@app.route('/')
def index():
	cur = g.db.execute('select id,time,title,url,context,reason,votes from entries order by id desc')
	entries = [dict(
			id=row[0],
			time=row[1],
			title=row[2], 
			url=row[3],
			context=row[4],
			reason=row[5],
			votes=row[6]
		) for row in cur.fetchall()]
	return render_template('index.html', entries=entries)

# API test page
@app.route('/api')
def api():
    return render_template('api.html')

# Bookmarklet
@app.route('/bookmarklet')
def bookmarklet():
    return open(os.path.dirname(__file__) + "/../../bookmarklet/bookmarklet.js").read()

# Favicon
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Vote API
@app.route('/vote', methods=['POST'])
def vote():
    id = request.form['id']
    #get current number of votes
    cur = g.db.execute('SELECT votes FROM entries WHERE id = ?', id)
    votes = cur.fetchone()[0]
    #increment and update
    votes = votes + 1
    sqlData = [votes, id]
    g.db.execute('UPDATE entries SET votes = ? WHERE id = ?', sqlData)
    g.db.commit()
    return json.dumps({ 'id': id, 'votes': votes })

# Submission API
@app.route('/submit', methods=['GET', 'POST'])
def submit():
	if request.headers['Content-Type'] == 'application/json':
		jsondata = request.json
	else:
		jsondata = {
			"url": 		request.form['url'],
			"title": 	request.form['title'],
			"context": 	request.form['context'],
			"reason": 	request.form['reason'],
			"lon": 		request.form['lon'],
			"lat": 		request.form['lat']
		}

	# Consistent encoding
	try:
		if jsondata['url']:   jsondata['url'] = u'' + jsondata['url'].decode('utf-8').strip()
		if jsondata['title']: jsondata['title'] = u'' + jsondata['title'].decode('utf-8').strip()
		print "[info] adding %s|%s" % (jsondata['url'], jsondata['title'])
	except UnicodeEncodeError:
		if jsondata['url']:   jsondata['url'] = u'' + unicode(jsondata['url']).strip()
		if jsondata['title']: jsondata['title'] = u'' + unicode(jsondata['title']).strip()
		print "[info] encoding %s|%s" % (repr(jsondata['url']), repr(jsondata['title']))
	
	# Validation
	if jsondata['url'] and len(jsondata['url']) < 2: jsondata['url'] = None
	if jsondata['title'] and len(jsondata['title']) < 2: jsondata['title'] = None	
	if not (jsondata['url'] and jsondata['title']):
		return json.dumps({ 'ErrorCode': 401, 'Message': "Parameters missing" })

	# Save the submission
	timestamp = int(time.time())
	jsonform = [
		jsondata['url'],
		jsondata['title'],
		jsondata['context'],
		jsondata['reason'],
		jsondata['lon'],
		jsondata['lat'],
		timestamp,
        int(1) # vote
	]

	# Push to database
	g.db.execute('insert into entries (url, title, context, reason, lon, lat, time, votes) values (?, ?, ?, ?, ?, ?, ?, ?)', jsonform)
	g.db.commit()

	# Get the last entry
	cur = g.db.execute('SELECT id FROM entries ORDER BY id DESC LIMIT 1')
	jsondata['id'] = cur.fetchone()[0]
	return json.dumps(jsondata)

def connect_db():
    return sqlite3.connect(DATABASE)

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

@app.template_filter()
def timesince(dt, default="just now"):
	"""
	Returns string representing "time since" e.g.
	3 days ago, 5 hours ago etc.
	"""
	if not dt:
		return "?"
	now = datetime.utcnow()
	dt = datetime.utcfromtimestamp(int(dt))
	diff = now - dt
	periods = (
		(diff.days / 365, "year", "years"),
		(diff.days / 30, "month", "months"),
		(diff.days / 7, "week", "weeks"),
		(diff.days, "day", "days"),
		(diff.seconds / 3600, "hour", "hours"),
		(diff.seconds / 60, "minute", "minutes"),
		(diff.seconds, "second", "seconds"),
	)
	for period, singular, plural in periods:
		if period:
			return "%d %s ago" % (period, singular if period == 1 else plural)
	return default

# Standard app construct
if __name__ == "__main__":
    port = int(os.environ.get('PORT', SERVER_PORT))
    app.run(host='0.0.0.0', port=port)
