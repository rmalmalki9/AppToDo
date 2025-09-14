define({ 
  
  
  init: function(){
    
    var v = this.view;
    
     if (v.btnSave) 
       v.btnSave.onClick = this.onSaveClick.bind(this);
    
     if (v.btnCancel) 
       v.btnCancel.onClick = this.onCancelClick.bind(this);
   
    
  },

  
  onNavigate: function(txtask){
    var v = this.view ;
    
    if(v.txtAdd)
      v.txtAdd.text = "";
    
     //to make the calander date be in today's date 
    if (v.CalanderDate){
      var today = new Date() ;
      
      v.CalanderDate.dateComponents = [ today.getDate(), today.getMonth() + 1, today.getFullYear(), 0, 0, 0];
      
    }
       
  },
  

  //for formatting the date 
  getDateString: function() {
    
    var cal = this.view.CalanderDate ;
    
    if (!cal)
      return "";

    if (cal.formattedDate){
      
      return cal.formattedDate;
      
    }

    return "" ;

  },

  
  
  
  onSaveClick: function(){
    
   var taskText = (this.view.txtAdd && this.view.txtAdd.text || "").trim();
   var duedate = this.getDateString();
   var completed = false ;

    if (!taskText){
      kony.ui.Alert({
        message: "Please Enter Task Name" , alertType: constants.ALERT_TYPE_INFO
      }, {} );
      return ;
    }

    if (!duedate){
      kony.ui.Alert({
        message: "Please Select Due Date",alertType: constants.ALERT_TYPE_INFO
      }, {} );
      return;
    }
    
    var nav = new kony.mvc.Navigation("frmHome");
      nav.navigate({
        newtask: {
          task: taskText,
          duedate: duedate,
          completed: false,
          isFromApi: false,
          _localId: String(Date.now())
          
        }
      });
    
    
  },
  

  onCancelClick: function(){
    
    var nav = new kony.mvc.Navigation("frmHome");
    nav.navigate();
    
  }

});