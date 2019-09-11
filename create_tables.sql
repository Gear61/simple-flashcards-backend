CREATE TABLE Account (
	id SERIAL,
	name varchar(256),
	email varchar(256),
	profile_picture_url varchar(1024),
	login_type varchar(16),
	password varchar(512)
);
