class JsonApp {
  static path = require('path')
  static fs = require('fs')

  static Read(property,limit) {
    this.results = this.dataDB[property].filter(item=>item.id != "");
    if (this.results) {
      if(typeof limit === "number" && this.results.length > limit){
        this.results.length = limit+1
      }
      return this.results;
    }
    return `Not Found ${property}`;
  }
  static find(property,id,callback){
    if(!this.dataDB[property]) return
    let result = this.dataDB[property].find(el=>el.id == id)

    if(typeof callback === "function"){
      callback(result)
    }
  }
  static insertKey(config) {
    const { property = "", namekey = "", callback } = config
    // insert main key
    if (!this.dataDB[property] && namekey == "") {
      this.dataDB = { ...this.dataDB, [property]: [] };
      this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
      callback({
        property,
        namekey
      })
      return;
    }
    // insert a property to the property main
    if (!this.dataDB[property]) return `Not Found ${property}`;
    
    if(this.dataDB[property].length){

      if (this.dataDB[property][0][namekey] == namekey)
      return `The key: ${namekey} already exists`;

    }

    if (namekey.trim() == "") return `Key undefined`;
    this.dataDB[property][namekey] = "";

    let data = [];
    if(this.dataDB[property].length){
      this.dataDB[property].forEach((item) => {
        data.push({ ...item, [namekey]: "" });
      });
    }else{
      data.push({[namekey]:''})
    }
    this.dataDB[property] = data;
    this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    callback({
      property,
      namekey
    })
  }

  static deleteKey(config) {
    const { property = "", namekey = "", callback } = config;
    // insert main key
    if (this.dataDB[property] && namekey == "") {
      delete this.dataDB[property]
      this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
      callback({
        property,
        namekey
      })
      return;
    }

    if (!this.dataDB[property]) return `Not Found ${property}`;

    if (this.dataDB[property][0][namekey] == undefined)
      return "Key no exist in the db";

    if(Object.keys(this.dataDB[property][0]).length > 1){
      this.dataDB[property].filter((el) => delete el[namekey]);
    }else{
      this.dataDB[property] = []
    }
    this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    callback({
      property,
      namekey
    })
  }

  static updateKey(config = {}) {
    const { property = "", namekey = "", newKey = "" , callback } = config;
    if (this.dataDB[property] && newKey == "") {

     let obj = Object.entries(this.dataDB).map(([key,value])=>{
      return  key == property ? [namekey,value] : [key,value] ;
      })
      let data = {}
      obj.forEach(el=>{
        data[el[0]] = el[1]
      })
      this.dataDB = data
      this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
      if(typeof callback === "function"){
        callback({
          property,
          namekey,
          newKey
        })
      }
      return
    }

    if (!this.dataDB[property]) return `Not Found ${property}`;
    if (this.dataDB[property][0][namekey] == undefined) return `key undefined`;
    let data = [];
    let newItem = {};

    this.dataDB[property].filter((el) => {
      Object.keys(el).forEach((item) => {
        if (item === namekey) {
          newItem = { ...newItem, [newKey]: el[item] };
        } else {
          newItem = { ...newItem, [item]: el[item] };
        }
      });
      data.push(newItem);
    });

    this.dataDB[property] = data;

    this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    if(typeof callback === "function"){
      callback({
        property,
        namekey,
        newKey
      })
    }
  }
  static search(property, keyword = {},callback) {
    if (!this.dataDB[property]) return `Not Found ${property}`;
    let key = Object.keys(keyword)[0];
    let value = keyword.exact ? keyword[key].toString() : new RegExp(keyword[key].toString());
    let result = "";
    if(!keyword.exact){
      result = this.dataDB[property].filter((el) => el[key].toString().match(value)) ??
      false;
    }else{
      result = this.dataDB[property].filter((el) => el[key].toString() == value ) ??
      false;
    }

    if(typeof callback === "function"){
      callback(result)
    }
  }
  static pagination(config = {}) {
    let { items, currentPage = 1, numberItems, numberPages } = config;
    if(!items.length) return []
    currentPage = parseInt(currentPage)
    let total = Math.ceil(items.length / numberItems);
    // Items
    const generateItems = (currentPage) => {
      currentPage = currentPage > total ? total : currentPage;
      let results = [];
      let maxItems =
        currentPage * numberItems > items.length
          ? items.length
          : currentPage * numberItems;
      let initialItems = currentPage * numberItems - numberItems;
  
      for (initialItems; initialItems < maxItems; initialItems++) {
        results.push(items[initialItems]);
      }
      return results;
    };
    // Pagination
    const generatePagination = (currentPage) => {
   
      let prevPage = 2;
      let nextPage = numberPages - prevPage;
      
      let max = currentPage + nextPage;

      let min = currentPage - 1;
      let pages = [];

      if (max > total) {
        max = total;
        min = total - numberPages + 1;
      }
      if (total > numberPages) {
        if (currentPage >= numberPages) {
          pages.push(1, "...");
          for (min; min <= max; min++) {
            pages.push(min);
          }
          if (currentPage <= total && max < total) {
            pages.push("...", total);
          }
        } else {
          for (let i = 1; i <= numberPages; i++) {
            pages.push(i);
          }
          pages.push("...", total);
        }
      } else {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      }
      return pages;
    };
    return {
      pageResults: generateItems(currentPage),
      pages: generatePagination(currentPage),
      total
    };
  }
  


  static #insertData(property, newID, data) {
    data = { id: newID, ...data };
    this.dataDB[property].push(data);
    this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
  }

  // insert
  static Insert(property = "", data = {}, callback) {
    if (!this.dataDB[property]) return `Not Found ${property}`;
    if (!Object.keys(data).length) return `Data is required`;

    let mainCompare = this.dataDB[property][0];
    let newID = 1;
    if (this.dataDB[property].length) {
      
      if (!this.#compareStructure(mainCompare, data)) {
        newID = this.#idAutoIncrement(this.dataDB[property].map((el) => el.id));
        this.#insertData(property, newID, data);
      } else {
        console.log("estructura incompatible: ",property);
      }
    } else {
      this.#insertData(property, newID, data);
    }

    if(typeof callback === "function"){
      callback(property, newID)
    }
  }
  static SimpleUpdate = (property,data,callback)=>{
    if (!this.dataDB[property]) return `Not Found ${property}`;
    this.dataDB[property] = data;
    this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    if(typeof callback === "function"){
      callback()
    }
  }
  // Update Item
  static Update(property = "", data = {},callback) {
    if (!this.dataDB[property]) return `Not Found ${property}`;

    if(Object.keys(data).length && data.id == undefined){

      Object.keys(data).forEach(key=>{
        this.dataDB[property][0][key] = data[key]
      })

      this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));

      if(typeof callback === "function"){
        callback({property})
      }

      return
    }

    let id = data.id;
    delete data.id;

    let results = this.dataDB[property];
    let item = results.filter((el) => el.id == id)[0];

    if (item) {

      Object.keys(data).forEach((el, i) => {
        item[el] = data[el];
      });

      this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));;

      if(typeof callback === "function"){
        callback({property})
      }
    }

  }
  // Delete Items
  static Delete(property = "", id = null,callback) {
    if (!this.dataDB[property]) return `Not Found ${property}`;
    if (!id) {
      return `Es necesario un id para eliminar un elemento de ${property}`;
    }

    this.dataDB[property] = this.dataDB[property].filter((el) => el.id != id);

    this.fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));

    if(typeof callback === "function"){
      callback(property, id)
    }
  }
  // get db.json ( get data )
  static DB(dirDB = null) {

    this.dirDB = dirDB ? dirDB : this.path.join(__dirname, "../", "db.json");

    let db = this.fs.readFileSync(this.dirDB, (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    this.dataDB = JSON.parse(db);

    Object.keys(this.dataDB).forEach((key) => {
      this.dataDB[key]
    });

    return this;
  }

  static #idAutoIncrement(ids = []) {
    return Math.max(...ids) + 1;
  }

  static #compareStructure(main, compare) {
    let errors = 0;
    let keysCompare = Object.keys(compare);
    let keysMain = Object.keys(main);

    if (
      keysCompare.length > keysMain.length - 1 ||
      keysCompare.length < keysMain.length - 1
    ) {
      errors++;
    }

    if (keysCompare.length) {
      keysMain.forEach((el, i) => {
        if (el != "id") {
          if (el != keysCompare[i - 1]) {
            errors++;
          }
        }
      });
    }

    return errors;
  }
}

module.exports = JsonApp;
