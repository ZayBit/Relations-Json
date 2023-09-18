class JsonApp {

  static Read(select) {
    this.results = this.dataDB[select];
    if(this.results){
      return this.results;
    }
    return `Not Found ${select}`;
  }

  static insertKey(property = "", namekey = "") {

    if(!this.dataDB[property]) return `Not Found ${property}`;
    if (this.dataDB[property][0][namekey] == namekey) return `The key: ${namekey} already exists`;
    if(namekey.trim() == "") return `Key undefined`;
    this.dataDB[property].reverse()
    this.dataDB[property][namekey] = "";
    let data = [];

    this.dataDB[property].forEach((item) => {
      data.push({ ...item, [namekey]: "" });
    });

    this.dataDB[property] = data;
    fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    this.dataDB[property].reverse()
  }

  static deleteKey(property = "", namekey = "") {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    if (this.dataDB[property][0][namekey] == undefined) return "Key no exist in the db";

    this.dataDB[property].reverse().filter((el) => delete el[namekey]);
    fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    this.dataDB[property].reverse()
  }

  static updateKey(property = "", namekey = "", newKey = "") {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    if (this.dataDB[property][0][namekey] == undefined) return `key undefined`;
    let data = [];
    let newItem = {};

    this.dataDB[property].reverse().filter((el) => {
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

    fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    this.dataDB[property].reverse()
  }
  static find(property, keyword = {}) {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    let key = Object.keys(keyword);
    let value = new RegExp(keyword[key].toString());
    let result =
      this.dataDB[property].find((el) => el[key].toString().match(value)) ?? false;
    return result
  }
  static pagination(property, currentPage = 1, totalForPage = 5) {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    let max = currentPage * totalForPage;
    let fin = totalForPage;
    let initial = max - fin;
    let items = [];

    for (initial; initial < max; initial++) {
      let item = this.dataDB[property][initial];
      if (!item) break;
      items.push(item);
    }
    
    let total = Math.ceil(this.dataDB[property].length / totalForPage);
    let pages = this.listPages(
      total, // total items length
      totalForPage, // max items for page
      currentPage // current page
    );

    return {
      items,
      pages,
    };
  }
  // create list of pages
  static listPages(totalItems, totalForPage, currentPage) {
    if (totalItems == 1) return [1];

    let totalNumberPages = totalForPage;
    let countNumberPages = 0;
    let pages = [];
    let max = currentPage + totalNumberPages;

    currentPage = currentPage - 1;

    if (
      currentPage + totalNumberPages - (totalNumberPages - 1) >=
      totalItems - 1
    ) {
      max = totalItems + 1;
      currentPage = max - totalNumberPages;
    }

    for (let i = currentPage; i < max; i++) {
      countNumberPages++;
      if (countNumberPages > totalNumberPages || countNumberPages > totalItems)
        break;

      if (currentPage + totalNumberPages == totalNumberPages) {
        pages.push(i + 1);
      } else {
        pages.push(i);
      }
    }

    return pages;
  }

  static #insertData(property, newID, data) {
    data = { id: newID, ...data };
    this.dataDB[property].reverse().push(data);
    fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    this.dataDB[property].reverse()
  }
  // insert
  static Insert(property = "", data = {}) {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    if(!Object.keys(data).length) return `Data is required`;
    
    let mainCompare = this.dataDB[property][0];
    let newID = 1;

    if (this.dataDB[property].length) {
      if (!this.#compareStructure(mainCompare, data)) {
        newID = this.#idAutoIncrement(this.dataDB[property].map((el) => el.id));
        this.#insertData(property, newID, data);
      } else {
        return "estructura incompatible";
      }
    } else {
      this.#insertData(property, newID, data);
    }

    return this.dataDB[property];
  }
  // Update Item
  static Update(property = "", data = {}) {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    if (!data.id) {
      return `Es necesario un id para actualizar un elemento de ${property}`;
    }

    let id = data.id;
    delete data.id;

    let results = this.dataDB[property].reverse();
    let item = results.filter((el) => el.id === id)[0];
    if(item){
      Object.keys(data).forEach((el, i) => {
        item[el] = data[el]
      })
      fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
      this.dataDB[property].reverse()
    }

  }
  // Delete Items
  static Delete(property = "", id = null) {
    if(!this.dataDB[property]) return `Not Found ${property}`;
    if (!id) {
      return `Es necesario un id para eliminar un elemento de ${property}`;
    }

    this.dataDB[property] = this.dataDB[property].filter((el) => el.id != id);
    this.dataDB[property].reverse()
    fs.writeFileSync(this.dirDB, JSON.stringify(this.dataDB));
    this.dataDB[property].reverse()
  }
  // get db.json ( get data )
  static DB(dirDB = null) {
    this.dirDB = dirDB ? dirDB : path.join(__dirname, "../", "db.json");

    let db = fs.readFileSync(this.dirDB, (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });
    
    this.dataDB = JSON.parse(db);
    
    Object.keys(this.dataDB).forEach(key=>{
      this.dataDB[key].reverse()
    })
    
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
