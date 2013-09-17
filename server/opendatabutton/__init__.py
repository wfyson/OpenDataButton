import os, uuid
from flask import Flask, render_template, send_from_directory, request, json, jsonify

# Database configuration
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

# Define Flask app
app = Flask(__name__)

# Home page
@app.route('/')
def index():
    return render_template('index.html')

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

# Submission API
@app.route('/submit', methods=['GET', 'POST'])
def submit():
	if request.headers['Content-Type'] == 'application/json':
		jsondata = request.json
	else:
		jsondata = {
			"url": 		request.form['url'],
			"title": 	request.form['title'],
			"context": 	int(request.form['context']),
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
	hash_key = str(uuid.uuid1())

	rv = cache.get(jsondata['url'])
	if rv is not None:
		rv.append(hash_key)
	else:
		rv = [hash_key]
	cache.set(jsondata['url'], rv, timeout=999999999999999999)
	cache.set(hash_key, jsondata, timeout=999999999999999999)
	jsondata['rv'] = rv
	return json.dumps(jsondata)

# Standard app construct
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
