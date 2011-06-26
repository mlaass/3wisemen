$(document).ready(function(){
	$(document).ready(function() {
		$('.dev-form').ajaxForm({
			success: function(res, status, xhr, form){
				form.find('.answer').html(res.out);
			}
		});
	});
});