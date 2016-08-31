$(document).ready(function(){
  compileNewCommentTemplate();
  compileEditCommentTemplate();
  newComment();
  editComment();
  updateComment();
});

class Comment {
  constructor(attributes){
    this.id = attributes.id;
    this.content = attributes.content;
    this.created_at = attributes.created_at;
    this.task_id = attributes.task_id;
    this.user_id = attributes.user_id;
  } 

  // Display a formatted date
  friendlyDate() {
    var date = new Date(this.created_at);
    var friendlyDate = this.formatDate(date);
    return friendlyDate;
  }

  // Format JS standard date
  formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " at " + strTime;
  }

  // render the handlebars NewComment template
  renderNewComment(){
    return newCommentTemplate({content: this.content, id: this.id, createdAt: this.friendlyDate()});
  }

  // render the handlebars EditComment template
  renderEditComment(){
    return editCommentTemplate({content: this.content, id: this.id, createdAt: this.friendlyDate()});
  }
}

// Create a new comment and add it to the page
function newComment() {
  $('#new_comment').submit(function(event) {
    event.preventDefault();
    var values = $(this).serialize();
    $.post('/projects/1/comments',values).success(function(data) {
        var comment = new Comment(data);
        var commentRender = comment.renderNewComment()
        $(".comments").prepend(commentRender);
        $("#comment_content").val("");
      });
  });
}

// GET Request the edit form for a comment
function editComment() {
  $('#edit-comment').click(function(event) {
    event.preventDefault();
    var href = $(this).attr('href');
    $.ajax({
      url: href,
      method: "GET",
      dataType: 'JSON'
    }).done(function(data) {
      var comment = new Comment(data);
      var commentRender = comment.renderEditComment();
      var id = '#' + data.id;
      $(id + ' .comment-content').html(commentRender);
      $(id + ' textarea').val(comment.content);
    });
  });
}

// Update the comment on the page via AJAX post request
function updateComment() {
  $(document).on("submit", ".save-comment", function(event) {
    event.preventDefault();
    var values = $(this).serialize();
    var id = $(event.target)[0].id
    var url =  "/comments/" + id.slice(13, id.length);
    $.ajax({
      url:  url,
      method: "POST",
      dataType: 'JSON',
      data: values
    }).success(function(data) {
      var comment = new Comment(data);
      var id = "#" + comment.id;
      $(id + ' .comment-content').html(comment.content);
    });
  }); 
}

// compile the handlebars NewComment template on load
function compileNewCommentTemplate(){
  var newCommentSource = $("#newCommentTemplate").html();
  if ( newCommentSource !== undefined ) {
    newCommentTemplate = Handlebars.compile(newCommentSource); 
  }
}

// compile the handlebars EditComment template on load
function compileEditCommentTemplate(){
  var editCommentSource = $("#editCommentTemplate").html();
  if ( editCommentSource !== undefined ) {
    editCommentTemplate = Handlebars.compile(editCommentSource); 
  }
}
