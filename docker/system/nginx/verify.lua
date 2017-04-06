local token = ngx.var.cookie_traP_ext_token or ""

local token_store = ngx.shared.token_store
local user = token_store:get(token)

if user == nil then
	local handle = io.popen("/etc/nginx/verify '" .. string.gsub(token, "'", "") .. "'")
	local user = handle:read("*all")
	handle:close()
	token_store:set(token, user)
end

ngx.req.clear_header("X-Showcase-User")

if user ~= "" then
	ngx.req.set_header("X-Showcase-User", user)
elseif ngx.var.policy == "soft" then
	ngx.req.set_header("X-Showcase-User", "-")
else
	ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
