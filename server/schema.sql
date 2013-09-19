drop table if exists entries;
create table entries (
  id integer primary key autoincrement,
  time int not null,
  title text not null,
  url text not null,
  context text not null,
  reason text not null,
  lon real,
  lat real,
  votes int
);