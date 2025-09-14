define({ 

 //Type your controller code here 

  onTaskDelete: function(){
    
    
    var from = kony.mvc.getController("frmHome");
    var ctx = (arguments && arguments[1]) ? arguments[1] : null ;
    
    kony.print("context from row " + JSON.stringify(ctx));
    
    if ( from && typeof from.deletedTask === "function"){
      from.deletedTask(ctx);
    }else{
      alert("frmHomeController.deletedTask NOT FOUND");
    }
  },
  
  onTaskCompleted: function(){
    
     var f = kony.application.getCurrentForm();
    var ctx = (arguments && arguments[1]) ? arguments[1] : null ;
    if ( f && f.controller && typeof f.controller.CompletedTask === "function"){
      f.controller.CompletedTask(ctx);
    }
  }
 });