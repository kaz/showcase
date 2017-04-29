"use strict";

($ => {

const initPage = _ => {
	API("list", {scope: /all=1/.test(location.search) ? "all" : "my"}).then(list => {
		const promises = [];
		
		$("#showcases").html(
			list.reverse().map(item => {
				promises.push(API("status", {repo: item.repo, ref: item.branch}));
				return [
					`<a target="_blank" href="https://${gitHost}/${item.repo}"><i class="fa fa-code-fork"></i> ${item.repo}`,
					`<a target="_blank" href="https://${gitHost}/${item.repo}/src/${item.branch}">${item.branch}`,
					item.config.type,
					`<span id="status_${item._id}"><i class="fa fa-spinner fa-spin"></i></span>`,
					makeExposePrintable(item.config.expose),
					item.config.type == "static" || item.config.http_proxy ? `<a target="_blank" href="http://${hostname(item)}"><i class="fa fa-external-link"></i> Open</a>` : "-",
					`<a id="detail_${item._id}" href="javascript:"><i class="fa fa-chevron-right"></i> View detail</a>`,
				].map(col => `<td>${col}</td>`).join();
			}).map(row => `<tr>${row}</tr>`).join()
		);
		
		return Promise.all(promises);
	}).then(statuses => {
		statuses.forEach(item => {
			const cfg = item.config;
			$(`#status_${item._id}`).html(item.status);
			$(`#detail_${item._id}`).on("click", _ => showDetail(item));
		});
	});
};

const showDetail = app => {
	const cfg = app.config;
	
	$("a[class^=detail], p[class^=detail]").html("-");
	
	$(".detailRepoName").html(app.repo);
	$(".detailRepoLink").html(`<a target="_blank" href="https://${gitHost}/${app.repo}"><i class="fa fa-code-fork"></i> ${app.repo}`);
	$(".detailBranchLink").html(`<a target="_blank" href="https://${gitHost}/${app.repo}/src/${app.branch}">${app.branch}`);
	$(".detailType").html(cfg.type);
	$(".detailStatus").html(app.status);
	$(".detailViewConfig").html(`<a target="_blank" href="https://${gitHost}/${app.repo}/src/${app.branch}/showcase.yaml"><i class="fa fa-wrench"></i> Open showcase.yaml`);
	$(".detailCreated").html(new Date(app.created).toLocaleString("ja-JP"));
	$(".detailUpdated").html(new Date(app.updated).toLocaleString("ja-JP"));
	
	$(".detailPrimaryName").html(`<a target="_blank" href="http://${hostname(app)}">${hostname(app)}</a>`);
	$(".detailCnames").html(cfg.cname.length ? cfg.cname.map(item => `<a target="_blank" href="http://${item}">${item}</a>`).join("<br>") : "-");
	$(".detailHttps").html(cfg.https);
	$(".detailHttpProxy").html(cfg.http_proxy ? `80/tcp -> ${cfg.http_proxy}/tcp` : "-");
	$(".detailExposedPort").html(makeExposePrintable(cfg.expose));
	$(".detailInternalAccess").html(cfg.internal);
	
	$(".detailServerHost").html(location.host);
	$(".detailWorkDir").html(cfg.work_dir);
	$(".detailEntrypoint").html(cfg.entrypoint);
	$(".detailStartup").html(cfg.startup);
	
	for(let key1 in app.keys){
		for(let key2 in app.keys[key1]){
			$(`.detailKey_${key1}_${key2}`).html(app.keys[key1][key2]);
		}
	}
	
	$(".detailLog").html(
		app.logs.reverse().map((item, index) => {
			return [
				new Date(item.created).toLocaleString("ja-JP"),
				`<span class="text-${colorMap[item.status]}"><i class="fa fa-${iconMap[item.status]}"></i> ${item.status}</td>`,
				`<a data-index="${index}" href="javascript:"><i class="fa fa-chevron-right"></i> View log</a>`,
			].map(col => `<td>${col}</td>`).join();
		}).map(row => `<tr>${row}</tr>`).join()
	)
	.find("a")
	.on("click", event => showLog(app.logs[parseInt($(event.currentTarget).data("index"))].log));
	
	$("#actionView").off("click").on("click", _ => showLog(app.stdout));
	$("#actionDeploy").off("click").on("click", _ => actionAPI("create", {repo: app.repo, ref: app.branch}));
	$("#actionStop").off("click").on("click", _ => actionAPI("action", {repo: app.repo, ref: app.branch, action: "stop"}));
	$("#actionStart").off("click").on("click", _ => actionAPI("action", {repo: app.repo, ref: app.branch, action: "start"}));
	$("#actionRestart").off("click").on("click", _ => actionAPI("action", {repo: app.repo, ref: app.branch, action: "restart"}));
	$("#actionDelete").off("click").on("click", _ => {
		if(confirm(`Are you sure you want to delete this application ${app.repo} (${app.branch}) ?`)){
			actionAPI("remove", {repo: app.repo, ref: app.branch});
		}
	});
	
	showElement(".detailRow");
};
const showLog = log => {
	$(".detailLogContent").html(log);
	showElement(".logRow");
};
const showAlert = (type, message) => $.notify({message}, {type});
const showElement = selector => {
	$(selector).slideDown();
	$(".main-panel").animate({scrollTop: $(selector).get(0).offsetTop + "px"});
};

const actionAPI = (api, param) => {
	$(".detailRow, .logRow").hide();
	$("#showcases").html(`<tr><th class="process" colspan="8"><i class="fa fa-spinner fa-spin"></i> Processing</th></tr>`);
	API(api, param)
	.then(result => showAlert("info", `OK: ${result}`))
	.catch(result => showAlert("danger", `NG: ${result.responseText}`))
	.then(initPage);
};

const colorMap = {
	Success: "success",
	Failed: "danger",
};
const iconMap = {
	Success: "check",
	Failed: "exclamation",
};

$(".detailRow, .logRow").hide();
$(initPage);

})(jQuery);
