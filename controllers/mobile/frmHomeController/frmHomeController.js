define({
 
  
  useApi: true,              
  _fabricInited: false,
  todolist: [],      
  localAdds: [],
  _loadOnce: true ,

  
  _initFabricIfNeeded: function (onOK) {
    if (this._fabricInited) { 
      if (onOK) 
        onOK(); 
      return; }
    try {
      KNYMobileFabric.init(
        {
          appKey:     "<Primary Key>",
          appSecret:  "<Secret Key>",
          serviceUrl: "URL"
        },
        function () { 
          
          this._fabricInited = true; 
          if (onOK) 
            onOK(); 
                    }.bind(this),
        
        function (err) {
          
          kony.print("Fabric init failed: " + JSON.stringify(err));
          if (onOK) 
            onOK();   
        }
      );
      
    } catch (e) {
      kony.print("Fabric init ex: " + e);
      if (onOK) 
        onOK();
    }
  },

  
  _parseTodos: function (res) {
    try {

      if (res && typeof res.ResponseBody === "string") {
        res = JSON.parse(res.ResponseBody);
      }

      if (res && Array.isArray(res.todos)) 
        return res.todos;

      if (Array.isArray(res)) 
        return res;

      if (res && Array.isArray(res.records)) 
        return res.records;
      
    } catch (e) {
      kony.print("parse err: " + e);
     } 
    return [];
  },

  
  _loadFromAPI: function (onDone) {
    this._initFabricIfNeeded(function () {
      try {
        
        var svc = KNYMobileFabric.getIntegrationService("TodoServiceMock"); 
        svc.invokeOperation(
          "listTodos",  
          {},           
          {},          
          
          function (res) {
            
            var list = this._parseTodos(res);

            this.todolist = (list || []).map(function (it) {
              
              return { task: it.task || "", 
                      duedate: it.duedate || "",
                      completed: false,
                      isFromApi: true,
                     
                      
                     };
            });
            
            if (onDone) 
              onDone(true, res);
            
          }.bind(this),
          
          function (err) {
            
            kony.print("invoke listTodos failed: " + JSON.stringify(err));
            if (onDone) 
              onDone(false, err);
            
          }.bind(this)
        );
        
      } catch (e) {
        
        kony.print("invoke ex: " + e);
        if (onDone) 
          onDone(false, e);
        
      }
    }.bind(this));
    
  },
  
    
  preShow: function () {
    
    var v = this.view;
    v.__controller = this;
    
  
    
    if (this.useApi) {
      this.refresh();
      
    } else {
      this.setDataFromtodolist();
    }
    
    if (this._loadOnce){
      v.segTasks.isVisible = false ;
    }
  
    
    if (v.btnAll)
      v.btnAll.onClick = this.showAll.bind(this);
    
    if (v.btnToday)
      v.btnToday.onClick = this.showToday.bind(this);
    
    if (v.btnRefresh) 
      v.btnRefresh.onClick = this.refresh.bind(this);
    
    if (v.segTasks)
      v.segTasks.onRowClick = this.onRowClick.bind(this);
    
    
  },
    


  onNavigate: function (ctx) {
    
   if (ctx && ctx.newtask) {
     
     this.localAdds.push(ctx.newtask);
     this.setDataFromtodolist();
   }
    
    
 },
  
     getMergedList: function(){
     
     return (this.todolist || []).concat(this.localAdds || []);
   },

  
  refresh: function () {
    
    var v = this.view;
   
    this._loadFromAPI(function (ok, raw) {
    
      this.setDataFromtodolist();
     
      
      if (!ok) {
        kony.ui.Alert({ 
          message: "Failed to load from service", 
          alertType: constants.ALERT_TYPE_INFO }, {});
      }
      

      
    }.bind(this));
    
  },
  


  setDataFromtodolist: function () {
    
     var v = this.view;
     var list = this.getMergedList();
    
     if (this.showTodayFilter) {
       
       list = (list || []).filter(function (it) {
         
         return it && it.duedate && this.dueTodayFilter(it.duedate);
         
       }.bind(this));
       
     }
     
   

      if (v.segTasks) {
      
        
       var rows = (list || []).map(function (it, idx) {
         
         var iscompleted = !!it.completed;
         
         return {
           
           lblTask: it.task, 
           lblDate: it.duedate, 
           isFromApi: !!it.isFromApi,
           lblIndex: String(idx),
           _localId: it._localId || null ,
           
           CalendarEmpty:{
             isVisible: true
           },
           
           btnDone: { 
             isVisible: !it.isFromApi && !iscompleted, 
             },

           
           lblCompleted: { 
             isVisible: iscompleted },
           
           btnDelete: { 
             isVisible: !it.isFromApi,
              },
          
           
           
         };
       }.bind(this));//end of function map 
 
       if (rows.length > 0) {
         
         v.segTasks.setData(rows);
         v.segTasks.isVisible = true ;
         this._loadOnce = false ;
         
       }
     }
    
     if (v.lblEmpty) {
       
       v.lblEmpty.text = this.showTodayFilter ? "There Is No Tasks To Do Today" : "There Is No Tasks To Do";
       v.lblEmpty.isVisible = (list.length === 0);
       if (v.lblEmpty.isVisible)
         v.segTasks.isVisible = false;
       
      }
    
  }, 
  
  
  CompletedTask: function( ctx){

  
    try {
      
      if (!ctx || typeof ctx.rowIndex !== "number")
        return ;
      
      var row = this.view.segTasks.data[ctx.rowIndex];
      
      if (row.isFromApi){
        kony.ui.Alert({
         message: "You can't complete this task " , 
         alertType: constants.ALERT_TYPE_INFO }, {});
       return ;
      }
      
      var it = this.localAdds.find(t => t._localId === row._localId);
      
      if (it){
        it.completed = true ;
        this.setDataFromtodolist();
      }

      
    }catch(e){
      kony.print("completed task error" + e);
    }
  
  },
  
  
  
  deleteTask: function( ctx){
    

     try {
      
      if (!ctx || typeof ctx.rowIndex !== "number")
        return ;
      
     var row = this.view.segTasks.data[ctx.rowIndex];
      
      if (row.isFromApi){
        kony.ui.Alert({
         message: "You can't delete this task " , 
         alertType: constants.ALERT_TYPE_INFO }, {});
       return ;
      }
      

      kony.ui.Alert({
       message: "Do you want to delete this task?",
       yesLabel: "YES",
       noLabel: "NO",
       alertType: constants.ALERT_TYPE_CONFIRMATION,
      
       alertHandler: function(response){
        
         
        var isYes = response === true ;
        
        if (isYes){
          
          var i = this.localAdds.findIndex(t => t._localId === row._localId);
          
          if (i >= 0){
            
            this.localAdds.splice(i, 1);
            this.setDataFromtodolist();
          }
         
        }
 
          
      }.bind(this)

    }, {});
      
      
    }catch(e){
      kony.print("completed task error" + e);
    }
   
   
  },
  
  
  
//this is to show all the tasks in the list 
  showAll: function(){
    
    var v = this.view;
   
    this.showTodayFilter = false ;
  
    v.btnAll.skin = "btnSelected" ;
    v.btnToday.skin = "btnUnselected";
    
    this.setDataFromtodolist();
    
  },
  

// this to show the tasks for today 
  showToday: function (){
    var v = this.view;
    
    this.showTodayFilter = true ;
    
    v.btnAll.skin = "btnUnselected" ;
    v.btnToday.skin = "btnSelected";
    
    this.setDataFromtodolist();
    
  },
  
  
  
  dueTodayFilter: function(dateStr){
    
    try{
      var p = dateStr.split("/");
      
      if (p.length < 3)
        return false ;
      
      var day = parseInt(p[0], 10);
      var month = parseInt(p[1], 10)-1 ;
      var year = parseInt(p[2], 10);
      var today = new Date();
     
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear())
        return true ;
      
      else 
        return false ;
      
      
    }catch(e){
      return false  ;
    }
  },
    

  
  //when clicking a row
  onRowClick: function(seg, sec, row){
    
    var self = this ;
    var r = this.view.segTasks.data[row];
    
 

    var item = {
      task: r.lblTask,
      duedate: r.lblDate,
     
    };

    kony.ui.Alert({
      
       message: " " + r.lblTask + "\n " + r.lblDate   ,
       alertType: constants.ALERT_TYPE_INFO,      
    }, {} );

  },
 
    
 

  
 });