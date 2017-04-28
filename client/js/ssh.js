"use strict";

($ => {

$("div.toggle").hide();
$(_ => {
	$("#sync").on("click", _ => {
		$(".toggle").toggle();
		API("update_key", {name: window.UserName})
		.then(result => showAlert("info", `OK: ${result}`))
		.catch(result => showAlert("danger", `NG: ${result.responseText}`))
		.then(_ => $(".toggle").toggle());
	});
});

const showAlert = (type, message) => $.notify({message}, {type});

const API = (api, param) => $.ajax({
	url: `/api/${api}`,
	data: param,
	xhrFields: {
		withCredentials: true
	}
});

})(jQuery);
