$(document).ready(function(){
	$(document).ready(function() {
		$('.dev-form').ajaxForm({
			success: function(res, status, xhr, form){
				form.find('.answer').html(res.out);
			}
		});
		$('.question-form').ajaxForm({
			success: function(res, status, xhr, form){
				form.parent().find('.sub-form .question').html(res.input);
				form.parent().find('.sub-form .input').val(res.input);
			}
		});
		$('.sub-form').ajaxForm({
			success: function(res, status, xhr, form){
				form.find('.question').html(res.input);
				form.find('.input').html(res.input);
			}
		});
		
		$('#talk-form').ajaxForm({
			success: function(res, status, xhr, form){
				$('#speech').html(res.out);
				$('#question-input').val('');
				$('#talk-form input').blur();
			}
		});
		$('canvas').click(function(){
			$('#talk-form input').blur();
		});
	});
});