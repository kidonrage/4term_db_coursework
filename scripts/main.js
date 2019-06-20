$( document ).ready(function() {
	$('.helpDataAddForm').submit(function(e) {
		var $form = $(this);
		$.ajax({
			url: '../addHelpData',
			type:'POST',
			data: $form.serialize()
		}).done(response => {
			$form.parent().children('ul').append('<li><span>'+response.request.name+'</span><a href="/deleteHelpData/' + response.request.target + '/' + response.id + '">×</a></li>');
			$form.find('input[name="name"]').val("");
			console.log(response);
		}).fail(function() {
			console.log('fail');
		});
		e.preventDefault(); 
	});

	$('#helpdataModal').on('click','.tab-pane ul li a',function(e){
		e.preventDefault()
		$.ajax({
			url: $(this).attr("href"),
			type:'GET'
		}).done(response => {
			$(this).parent().remove()
			console.log(response);
		}).fail(function() {
			console.log('fail');
		});
	});

	$('#addModal').on('show.bs.modal', function (event) {
		$.ajax({
			type: 'GET',
			url: 'http://localhost:8080/getHelpData/all',
			dataType: 'json'
		})
		.done(function(data) {
			$('#addModal select').html('<option selected="true" disabled="disabled">Выберите</option>');
			data.goodsCategories.forEach(row => {
				$('#addModal select[name="category"]').removeAttr('disabled');
				$('#addModal select[name="category"]').append('<option>'+ row.name +'</option>');
			});
			data.manufacturers.forEach(row => {
				$('#addModal select[name="manufacturer"]').removeAttr('disabled');
				$('#addModal select[name="manufacturer"]').append('<option>'+ row.name +'</option>');
			});
		})
		.fail(function(jqXHR, textStatus, err) {
			console.log('Error getting help data:', textStatus);
		})
	});

	$(".custom-file-input").on("change", function() {
		var fileName = $(this).val().split("\\").pop();
		$(this).siblings(".custom-file-label").addClass("selected").html(fileName);
	});
});

function getHelpData(target, ulObject) {
	$.ajax({
		type: 'GET',
		url: 'http://localhost:8080/getHelpData/' + target,
		dataType: 'json'
	})
	.done(function(data) {
		ulObject.empty()
		data.forEach(row => {
			ulObject.append('<li><span>'+row.name+'</span><a href="/deleteHelpData/' + target + '/' + row.id + '">×</a></li>');
		});
	})
	.fail(function(jqXHR, textStatus, err) {
		console.log('Error getting help data:', textStatus);
	})
}

