local token = ngx.var.cookie_traP_ext_token or ""

local token_store = ngx.shared.token_store
local user = token_store:get(token)

if user == nil then
	local handle = io.popen("/etc/nginx/verify '" .. string.gsub(token, "'", "") .. "'")
	user = handle:read("*all")
	handle:close()
	token_store:set(token, user)
end

ngx.req.clear_header("X-Showcase-User")
ngx.req.set_header("X-Showcase-User", user)

return user
