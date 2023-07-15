import inquirer from "inquirer";
import colors from "colors";
import fs from "fs";
import csv from "csvtojson";

// Preguntas que usamos para activar la función prompt de la librería inquirer
const question = [
  {
    type: "input",
    name: "name",
    message: "Elige una opción: ".blue,
  },
];

const seccion = [
  {
    type: "input",
    name: "name",
    message: "Escribe la sección: ".blue,
  },
];

const questions = [
  {
    type: "input",
    name: "name",
    message:
      "Información del producto separado por ',' \n".blue +
      "Nombre, Categoria, Precio, Cantidad: \n" +
      "\n",
  },
];

const categoria = [
  {
    type: "input",
    name: "name",
    message: "Escribe la categoria: ".blue,
  },
];

const borrar = [
  {
    type: "input",
    name: "name",
    message: "Escribe el nombre de producto que se va a eliminar: \n".blue,
  },
];

const venta = [
  {
    type: "input",
    name: "name",
    message:
      "Información de venta separada por ',': \n".blue +
      "Con el siguiente format dd/mm/aaaa\n" +
      "Dia, Mes, Año, Total Vendido: \n",
  },
];

const ventas = [
  {
    type: "input",
    name: "name",
    message: "Elige una opción: ".blue,
  },
];

const producto = [
  {
    type: "input",
    name: "name",
    message: "Desea agregar otro producto? y/n: ".blue,
  },
];

// Iniciamos la terminal esperando respuestas para posteriormente asignar funciones.{
function main() {
  // Menú de secciones por consola, usamos la librería colors para poder leer mejor la terminal.
  console.log(
    "\n¿Qué sección deseas buscar / modificar?\n".blue +
      "1. Inventario de la farmacia.\n" +
      "2. Ventas de la farmacia.\n" +
      "3. Salir.\n"
  );
  inquirer.prompt(seccion).then((b) => {
    if (b.name == "1") {
      // Menú de opciones, usamos la librería colors para poder leer mejor la terminal.
      console.log(
        "\n" +
          "Bienvenido a la farmacia! \n".green +
          "\n" +
          "Lista de funciones: \n".blue +
          "1. Listar productos \n" +
          "2. Buscar producto \n" +
          "3. Agregar producto \n" +
          "4. Eliminar producto \n" +
          "5. Salir \n"
      );

      // Iniciamos la terminal esperando respuestas para posteriormente asignar funciones.
      function options() {
        inquirer.prompt(question).then((a) => {
          if (a.name == "1") {
            // Listar productos, usamos la librería csvtojson para convertir el archivo csv a JSON y poder leerlo en la terminal.
            csv()
              .fromFile("bd.csv")
              .then((json) => {
                console.table(json);
                main();
              });
          } else if (a.name == "2") {
            // Buscar productos por categoria y devolverlos, los comparamos con un filter y regresamos en una tabla los resultados que coincidan
            inquirer.prompt(categoria).then((a) => {
              csv()
                .fromFile("bd.csv")
                .then((json) => {
                  let result = json.filter((item) => item.Categoria == a.name);
                  console.table(result);
                  main();
                });
            });
          } else if (a.name == "3") {
            // Creamos una variable que sea de contador, luego creamos una función que reciba por parte (objetos) de JSON y los cuente, haciendo ++1 por cada objeto que cuente, esto para automatizar los ID en los próximos objetos creados.s
            let count = 0;
            fs.createReadStream("bd.csv")
              .on("data", (chunk) => {
                for (let i = 0; i < chunk.length; ++i)
                  if (chunk[i] == 10) count++;
              })
              .on("end", () => {
                return count + 1;
              });

            function categoria() {
              inquirer.prompt(questions).then((a) => {
                // Separámos el texto de respuesta con un split basándonos en las ","
                const text = a.name.split(",")[1].toString();

                // Revisar que la categoría sea válida con el text que almacenamos
                if (
                  text != "Bebidas" &&
                  text != "Alimentos" &&
                  text != "Otros" &&
                  text != "Antibióticos" &&
                  text != "Desinflamantes" &&
                  text != "Analgésicos" &&
                  text != " Bebidas" &&
                  text != " Alimentos" &&
                  text != " Otros" &&
                  text != " Antibióticos" &&
                  text != " Desinflamantes" &&
                  text != " Analgésicos"
                ) {
                  categoria();
                  console.log(
                    "Categoría no válida.".red +
                      "\n" +
                      "Las categorías válidas son: \n".blue +
                      "Alimentos, Bebidas, Otros, Antibióticos, Desinflamantes, Analgésicos"
                  );
                } else {
                  // Separámos el texto de respuesta con un split basándonos en las "," similar a lo que hicimos antes
                  const name = a.name.split(",")[0].toString();

                  // Revisar que el nombre no esté repetido, nuevamente extraemos la información y la comparamos con el nombre de todos los productos para ver que no se repita
                  csv()
                    .fromFile("bd.csv")
                    .then((json) => {
                      let result = json.filter((item) => item.Nombre == name);
                      if (result.length > 0) {
                        console.log(
                          "\nEl producto ya existe \n".red +
                            "Por favor ingrese otro producto: ".blue
                        );
                        inquirer.prompt(producto).then((a) => {
                          if (a.name == "y") {
                            categoria();
                          } else {
                            main();
                          }
                        });
                      } else {
                        // Finalmente una vez ya haber pasado por los filtros anteriores, agregamos el producto al archivo csv
                        fs.writeFileSync(
                          "bd.csv",
                          `\n${count + 1}, ${a.name}`,
                          {
                            flag: "a",
                          }
                        );
                        console.log("\nProducto agregado \n".green);
                        main();
                      }
                    });
                }
              });
            }
            categoria();
          } else if (a.name == "4") {
            csv()
              .fromFile("bd.csv")
              .then((json) => {
                const tabla = json;
                // Pedimos el nombre del producto que se desea eliminar, lo comparamos con el .Nombre de tabla, si existe lo eliminamos
                inquirer.prompt(borrar).then((a) => {
                  let result = tabla.filter((item) => item.Nombre == a.name);
                  if (result.length > 0) {
                    console.log("Producto eliminado".green);
                    fs.writeFileSync("bd.csv", "");
                    fs.writeFileSync(
                      "bd.csv",
                      "ID, Nombre, Categoria, Precio, Cantidad",
                      {
                        flag: "a",
                      }
                    );
                    // Agregamos nuevamente los elementos pasando por el filtro
                    tabla.forEach((item) => {
                      if (item.Nombre != a.name) {
                        fs.writeFileSync(
                          "bd.csv",
                          `\n${item.ID}, ${item.Nombre}, ${item.Categoria}, ${item.Precio}, ${item.Cantidad}`,
                          {
                            flag: "a",
                          }
                        );
                      }
                    });
                    main();
                  } else {
                    // Si no hay productos para borrar devolvemos por consola
                    console.log("Producto no encontrado".red);
                    main();
                  }
                });
              });
          } else if (a.name == "5") {
            return;
          } else {
            // Si no coincide la función solicitada con las existentes, regresamos un texto.
            console.log(
              "Opción no válida, \n".red + "Ingresa una opción válida: \n"
            );
            options();
          }
        });
      }
      options();
    } else if (b.name == "2") {
      // Preguntamos con el inquirer por la opción que se quiera realizar
      function call() {
        console.log(
          "\nLista de funciones: \n".blue +
            "1. Ver ventas \n" +
            "2. Agregar venta \n" +
            "3. Salir \n"
        );
        inquirer.prompt(ventas).then((a) => {
          // Si la opción es 1, mostramos el inventario
          if (a.name == "1") {
            csv()
              .fromFile("ventas.csv")
              .then((json) => {
                console.table(json);
                main();
              });
          } else if (a.name == "2") {
            function producto() {
              inquirer.prompt(venta).then((a) => {
                const dia = a.name.split(",")[0].toString();
                const mes = a.name.split(", ")[1].toString();
                const año = a.name.split(", ")[2].toString();
                const cantidad = a.name.split(", ")[3].toString();
                // comprobar que dia sea un entero y no un string
                const pass =
                  Number.isInteger(parseInt(dia)) &&
                  Number.isInteger(parseInt(mes)) &&
                  Number.isInteger(parseInt(año));
                if (pass) {
                  if (
                    dia.length === 2 &&
                    mes.length === 2 &&
                    año.length === 4
                  ) {
                    fs.writeFileSync(
                      "ventas.csv",
                      `\n${dia}, ${mes}, ${año}, $${cantidad}`,
                      {
                        flag: "a",
                      }
                    );
                    console.log("\nProducto agregado \n".green);
                    main();
                  } else {
                    console.log(
                      "Fecha no válida, usa un espacio despues de la ','".red +
                        "\n" +
                        "Las fechas válidas son: \n".blue +
                        "DD, MM, AAAA"
                    );
                    main();
                  }
                } else {
                  console.log(
                    "\nFormato de fecha no válido, sólo se admiten valores tipo int,".red +
                      "\n" +
                      "El formato válido es: \n".blue +
                      "DD, MM, AAAA"
                  );
                  main();
                }
              });
            }
            producto();
          } else if (a.name == "3") {
            return;
          } else {
            // Si no coincide la función solicitada con las existentes, regresamos un texto.
            console.log(
              "Opción no válida, \n".red + "Ingresa una opción válida: \n"
            );
            call();
          }
        });
      }
      call();
    } else if (b.name == "3") {
      return;
    } else {
      // Si el usuario selecciona una opción que no existe, regresamos un texto.
      console.log(
        "La sección que escogiste no existe, \n".red +
          "Ingresa una opción válida: \n"
      );
      main();
    }
  });
}

main();
