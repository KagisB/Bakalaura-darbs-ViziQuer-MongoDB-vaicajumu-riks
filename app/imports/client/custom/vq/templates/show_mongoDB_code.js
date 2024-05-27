import './show_mongoDB_code.html'

Template.mongoDBForm.onRendered( async function() {
  let query = document.getElementById("generated-mongoDB");
  Template.mongoDBForm.mongoQuery = new ReactiveVar(query);
});
