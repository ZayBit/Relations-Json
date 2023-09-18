# Proyecto para utilizar un JSON como base de datos

Este proyecto incluye las siguientes caracteristicas:

- CRUD para el contenido de la db
- CRUD para modificar la estructura del JSON (db)
- Paginacion
- Carga de archivos (local)
- Descarga de imagenes por medio de url
- Buscador de un elemento dentro del JSON
- ID autoincremental

> Crud de nuestra base de datos db.json

```json
{
  "nombres": [
    {
      "id": 1,
      "nombre": "lucas",
      "edad": 27,
      "apellido": "hernan",
      "altura": 1.74
    },
    {
      "id": 3,
      "nombre": "berenice",
      "edad": 41,
      "apellido": "martin",
      "altura": 1.57
    }
  ],
  "email": [
    { "id": 1, "email": "franci_sco1@correo.com" },
    { "id": 2, "email": "an2_Aa2@correo.com" },
    { "id": 3, "email": "carlo4_s@correo.com" },
    { "id": 4, "email": "perl5wa@correo.com" }
  ]
}
```

### Requerir la clase App llamando a App.DB()

```javascript
const JsonApp = require("JsonApp");
const JsonAppDB = JsonApp.DB();
```

### Operaciones del CRUD

 Los valores tienen del la `db` que coincidir con las **propiedades** al momento de insertar los datos EJ.

```javascript
JsonAppDB.Insert("nombres", {
  nombre: "carlos",
  edad: 31,
  apellido: "gomez",
  altura: 1.74,
});
```

`db.json`

```json
{
  "nombres": [
    {
      "id": 1,
      "nombre": "saul",
      "edad": 27,
      "apellido": "martin",
      "altura": 1.57
    }
  ]
}
```

Al actualizar los datos no es necesario escribir todo el objeto, unicamente es necesaria la propiedad del objeto

```javascript
// id para actualizar o eliminar el elemento
let id = 3;

// Actualizar datos en nombres
JsonAppDB.Update("nombres", { id: id, nombre: "alejandra", edad: 24 });

// Eliminar datos en nombres
JsonAppDB.Delete("nombres", id);
```

## **CRUD** de la para modificar la estructura de la DB

```javascript
// Insertar una nueva propiedad: inserta una nueva propiedad llamada "nombre"
JsonAppDB.insertKey("nombres", "apodo");

// Actualizar una nueva propiedad: cambia "apodo" por "nombre"
JsonAppDB.updateKey("nombres", "apodo", "nombre");

// Insertar una nueva propiedad: Eliminar la propiedad "nombre"
JsonAppDB.deleteKey("nombres", "nombre");
```

## Buscar un elemento

```javascript
// Busca en "nombres" un objeto que por apellido tenga "rti"
// Supongamos "Martin" y en este caso encontro uno que coinciden
JsonAppDB.find("nombres", { apellido: "rti" });
```

## Paginacion

```javascript
// Obtenemos la paginacion de "nombres" seguido de la pagina actual y el numero de paginas a mostrar Ej 4.

// 1 2 3 4 de 100. se generaran automaticamente conforme avance ej. 1,2,3,4 - 2,3,4,5 - 3,4,5,6
JsonAppDB.pagination("nombres", currentPage, 4);

let currentPage = 1;

// Esto retorna dos valores: items y pages. data:{ items, pages }
let data = JsonAppDB.pagination("nombres", currentPage, 4);

data.items.forEach((item) => {
  // item.nombre, item.edad, etc...
});

data.pages.forEach((p) => {
  // `<a href="/home?p=${p}">${p}</a>`
});
```

# Cargar Archivos

### Requerir la clase UploadFiles
Para utilizar UploadFiles es necesario instalar `node-fetch`


```javascript

const callback = (res)=>{
  console.log(res);
}

const UploadFiles = require("UploadFiles");

 UploadFiles.Upload({

    srcList: data.src,
    dest:'../up/',
    manualFormat:'.gif',
    formats:['.jpg','.exe'],
    endCallback:callback,
    torewrite:["image2.jpg"],

    viewProgress:{
      selector:'.progress-list',
      style:'unique',
      showCount:true
    }

  });

UploadFiles.removeFile(["video.mp4"],(ms)=>{
  console.log('Message is: ',ms);
})
```
## Opciones de: Upload

| Tipo     | Propiedad   | Por defecto   | Descripcion                                                                                                      |   |
|----------|-------------|---------------|------------------------------------------------------------------------------------------------------------------|---|
| `Array`    | srcList     | []            | Lista de las imagenes ["imagen1.jpg","imagen2.jpg",etc]                                                          |   |
| `String`   | dest        | "../uploads/" | Cambia la ruta destino de los archivos, Toma de base la ruta de **UploadFiles.js**                               |   |
| `String`   | manualFormat        | false | Aplicar un formato especifico a el archivo, **".jpg"**, **".mp4"**, etc... |   |
| `Array`   | formats        | [".jpg",".png",".gif",".mp3",".mp4",".mkv",".avi",".wmv",] | Aceptar cierto tipo de formatos ej. [".exe",".txt"] por de |   |
| `Function` | endCallback | False      | Cuando termina el proceso se ejecuta, se reciben los nombres de los archivos **["nskei2s.jpg","am2sl4woq.jpg"]** |   |
| `String`   | torewrite   | []            | Arreglo con los nombres de la imagenes existentes para reemplazar las imagenes conservando el nombre del archivo |   |
| `Object`   | viewProcess | {}      | Propiedades: **selector**, **style**, **showCount**                                                              |   |

## Opciones de: viewProcess

| Tipo    | Propiedad | Por defecto | Descripcion                                                                       |   |
|---------|-----------|-------------|-----------------------------------------------------------------------------------|---|
| `String ` | selector  | false       | Nombre de la clase de un elemento donde se mostrara la lista de procesos en curso |   |
| `String`  | style     | "list"      | Estilos disponibles: **"list"**, **"list-bar"**, **"unique"**                     |   |
| `Boolean` | showCount | false       | Mostrar un contador dentro del contenedor que selecciono, ej. 1/6 - 6/6           |   |

La estructura cambia dependiendo del estilo seleccionado

`"list"`  muestra tanto el nombre del archivo y el porcentaje

![](1.png)
`"list-bar"` muestra solamente el porcentaje de cada archivo

![](2.png)
`"unique"` muestra unicamente un progreso por todos los archivos

![](3.png)