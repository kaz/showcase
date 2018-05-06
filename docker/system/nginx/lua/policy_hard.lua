local verify = require "verify"

if verify() == "-" then
	ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
