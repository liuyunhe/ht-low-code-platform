const $btn = $(_this.$el).find("button");
const $table = $(_this.$el).parents(".sun-table");
const $row = $(_this.$el).parents(".el-row");
// const $broRows=$row.siblings();
const $broRows = $table.find(".el-row");
if ($btn.text() == "收起") {
  $broRows.each(function (index) {
    if (index!==0) {
      $(this).hide();
    }
  });
  $btn.text("展开");
} else if ($btn.text() == "展开") {
  $broRows.each(function (index) {
    if (index!==0) {
      $(this).show();
    }
  });
  $btn.text("收起");
}
