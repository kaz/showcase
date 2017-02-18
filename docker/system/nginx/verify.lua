local token = ngx.var.cookie_traP_ext_token or ""

local handle = io.popen("/etc/nginx/verifier " .. token)
local user = handle:read("*all")
handle:close()

if user ~= "" then
	ngx.var.user = user
elseif ngx.var.policy == "reject" then
	ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
