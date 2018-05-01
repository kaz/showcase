local user = require "verify"

if user == "-" then
	ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
