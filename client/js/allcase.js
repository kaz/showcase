"use strict";

($ => {

$(_ => {
	API("list", {scope: "all"}).then(list => {
		$("#showcases").html(
			list.reverse().map(item => {
				return [
					`<a target="_blank" href="https://git.trapti.tech/${item.repo}"><i class="fa fa-code-fork"></i> ${item.repo}`,
					`<a target="_blank" href="https://git.trapti.tech/${item.repo}/src/${item.branch}">${item.branch}`,
					item.config.type,
					item.config.type == "static" ? "-" : item.config.image,
					makeExposePrintable(item.config.expose),
					item.config.type == "static" || item.config.http_proxy ? `<a target="_blank" href="http://${hostname(item)}"><i class="fa fa-external-link"></i> Open</a>` : "-",
					`<a target="_blank" href="https://git.trapti.tech/${item.repo}/src/${item.branch}/showcase.yaml"><i class="fa fa-wrench"></i> Open showcase.yaml`
				].map(col => `<td>${col}</td>`).join();
			}).map(row => `<tr>${row}</tr>`).join()
		);
	});
});

const makeExposePrintable = expose => expose ? (Array.isArray(expose) ? expose : [expose]).map(e => `${e}/tcp`).join(", ") : "-";

const hostname = app => {
	const name = app.repo.split("/").reverse().join(".") + ".trap.show";
	if(app.branch != "master"){
		return `${app.branch}.${name}`;
	}
	return name;
};

const API = (api, param) => $.ajax({
	url: `/api/${api}`,
	data: param,
	xhrFields: {
		withCredentials: true
	}
});

})(jQuery);
