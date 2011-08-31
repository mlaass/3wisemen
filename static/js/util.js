$(document).ready(function(){
	$(document).ready(function() {
		$('.dev-form').ajaxForm({
			success: function(res, status, xhr, form){
				form.find('.answer').html(res.answer);
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
				$('#speech').html(res.answer);
				$('#question-input').val('');
				$('#talk-form input').blur();
				
				if(res.enlighten){
					form.hide();
					$('#step-form').show();
					$jo.game.state = 'answer';
				}
			}
		});
		$('#step-form').ajaxForm({
			success: function(res, status, xhr, form){
				$('#speech').html(res.input);
				$('#talk-form input').blur();
				form.hide();
				$('#answer-form').show();
			}
		});
		$('#answer-form').ajaxForm({
			success: function(res, status, xhr, form){
				$('#speech').html(res.input);
				$('#question-answer').val('');
				$('#question-question').val(res.question);
				$('#talk-form input').blur();
				console.log(res);
			}
		});
		$('canvas').click(function(){
			$('#talk-form input').blur();
		});
	});
});