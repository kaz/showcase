local token = ngx.var.cookie_traP_ext_token or ""

local handle = io.popen("/etc/nginx/verifier " .. token)
local user = handle:read("*all")
handle:close()

ngx.log(ngx.ERR, user)

if user ~= "" then
	ngx.var.user = user
elseif ngx.var.reject ~= nil then
	ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
