$("table.main-table:first").find("tr").each(function () {
    　　$(this).children('td.main-title').each(function () {
                  
           $(this).css("display","none");
            
        });
          $(this).children('td.main-field').each(function () {
                  
           $(this).css("text-align","center");
            
        });
    });