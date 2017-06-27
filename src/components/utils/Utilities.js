export default {
  loadBinaryFile: function (path, success) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', path, true)
    xhr.responseType = 'arraybuffer'
    xhr.onload = function () {
      var data = new Uint8Array(xhr.response)
      var arr = []
      for (var i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i])
      }
      success(arr.join(''))
    }
    xhr.send()
  },
  sqlJsonify: function (sqlJson) {
    var result = [];
    var columns = sqlJson[0].columns
    var values =  sqlJson[0].values
    values.forEach(function(item,index){
      var obj = {}
      for (var i = 0; i < columns.length; i++) {
        obj[columns[i]] = item[i]
      }
      result.push(obj);
    })
    return result;
  },

  mergeObjs: function (obj1, obj2) {
      var obj3 = {};
      for (var attrname in obj1) {
          obj3[attrname] = obj1[attrname];
      }
      for (var attrname in obj2) {
          obj3[attrname] = obj2[attrname];
      }
      return obj3;
  }

}
