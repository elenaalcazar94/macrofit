// [nombre, tienda (M=Mercadona, L=Lidl, G=genérico), kcal, prot, carb, grasa (por 100 g/ml), ración g]
const FOODS_RAW = `
Pechuga de pollo fileteada Hacendado|M|110|23|0|2|150
Pechuga de pavo en lonchas Hacendado|M|98|19|1.5|1.5|60
Contramuslo de pollo deshuesado|M|160|18|0|10|150
Carne picada vacuno Hacendado|M|200|19|0|14|125
Carne picada mixta cerdo-vacuno|M|230|17|0|18|125
Lomo de cerdo cinta fileteado|M|145|21|0|6.5|150
Solomillo de cerdo|M|120|21|0|4|150
Filete de ternera|M|125|22|0|4|150
Hamburguesa de pollo Hacendado|M|150|16|4|8|100
Hamburguesa vacuno Hacendado|M|215|16|3|15|100
Jamón serrano lonchas Hacendado|M|240|31|0.5|13|40
Jamón cocido extra Hacendado|M|105|19|1|3|60
Lomo embuchado Hacendado|M|195|38|1|4|30
Salmón fresco lomos|M|200|20|0|13|125
Merluza filetes congelada Hacendado|M|75|16|0|1|150
Bacalao desalado Hacendado|M|85|19|0|0.8|150
Atún claro al natural Hacendado (escurrido)|M|105|25|0|0.8|56
Atún claro en aceite de oliva Hacendado (escurrido)|M|190|26|0|10|56
Gambas peladas congeladas Hacendado|M|75|17|0|0.8|100
Langostinos cocidos|M|90|20|0|1.5|100
Surimi palitos Hacendado|M|105|7|15|1.8|50
Sardinas en aceite Hacendado|M|210|24|0|13|60
Huevos L Hacendado (unidad 60 g)|M|143|12.6|0.7|9.9|60
Claras de huevo pasteurizadas Hacendado|M|48|11|0.7|0.2|150
Yogur griego natural Hacendado|M|122|6|4|10|125
Yogur natural Hacendado|M|60|3.5|4.5|3|125
Yogur proteínas natural Hacendado (+Proteínas)|M|58|10|4|0.2|200
Batido +Proteínas cacao Hacendado|M|70|8|6.5|1.3|250
Queso fresco batido 0% Hacendado|M|46|8|3.6|0.1|250
Queso fresco batido 0% proteínas Hacendado|M|62|11|3.5|0.2|250
Queso fresco Burgos Hacendado|M|176|13|2.5|12.5|60
Queso fresco Burgos 0% Hacendado|M|70|12|4|0.5|60
Queso cottage Hacendado|M|90|11|3|3.8|100
Mozzarella fresca Hacendado|M|240|18|1|18|62
Queso rallado mozzarella Hacendado|M|300|22|2|23|30
Queso curado Hacendado|M|420|27|0.5|35|30
Queso en lonchas light Hacendado|M|250|30|1|14|20
Leche semidesnatada Hacendado|M|46|3.1|4.7|1.6|250
Leche desnatada Hacendado|M|35|3.2|4.8|0.2|250
Leche entera Hacendado|M|63|3.1|4.7|3.6|250
Bebida de avena Hacendado|M|45|0.5|7|1.5|250
Bebida de soja Hacendado|M|39|3.3|1.5|2|250
Kéfir natural Hacendado|M|60|3.5|4|3.2|200
Tofu firme Hacendado|M|125|13|1.5|7.5|100
Avena en copos Hacendado|M|372|13.5|59|7|50
Harina de avena Hacendado|M|375|14|58|7.5|50
Arroz redondo Hacendado (crudo)|M|350|7|78|0.6|80
Arroz basmati Hacendado (crudo)|M|355|8|78|0.8|80
Arroz vasito cocido Hacendado|M|150|3|32|1|125
Pasta macarrones Hacendado (cruda)|M|358|12|71|1.5|80
Espaguetis integrales Hacendado (crudos)|M|350|13|64|2.5|80
Quinoa Hacendado (cruda)|M|370|14|60|6|70
Cuscús Hacendado (crudo)|M|360|12|72|1.5|70
Pan de molde integral Hacendado|M|245|10|41|3.5|30
Pan de molde 100% integral sin corteza|M|240|11|38|3.5|30
Pan barra|M|265|8.5|54|1.5|60
Tortitas de arroz Hacendado|M|380|8|80|2.8|8
Tortitas de maíz Hacendado|M|385|8|81|2.5|8
Tortillas de trigo wraps Hacendado|M|300|8.5|51|6.5|60
Patatas|M|77|2|17|0.1|200
Boniato|M|86|1.6|20|0.1|200
Patatas gajo congeladas Hacendado|M|130|2.2|19|4.5|150
Garbanzos cocidos bote Hacendado|M|115|7|13|2.5|200
Lentejas cocidas bote Hacendado|M|90|7|12|0.5|200
Alubias blancas cocidas Hacendado|M|90|6.5|11|0.5|200
Edamame congelado Hacendado|M|125|11|7|5|100
Hummus clásico Hacendado|M|300|7|11|25|30
Guacamole Hacendado|M|160|1.6|5|14|30
Aguacate|M|160|2|1.8|15|100
Aceite de oliva virgen extra Hacendado|M|884|0|0|100|10
Crema de cacahuete 100% Hacendado|M|610|28|12|49|15
Almendras naturales Hacendado|M|610|25|7|52|25
Nueces peladas Hacendado|M|680|15|7|65|25
Chocolate negro 85% Hacendado|M|590|11|19|50|20
Crema de cacao proteica Hacendado|M|430|20|31|25|15
Proteína whey sabor vainilla Hacendado|M|380|75|8|5|30
Barrita +Proteínas Hacendado|M|360|30|30|11|40
Mantequilla Hacendado|M|740|0.6|0.6|82|10
Mermelada 0% azúcar Hacendado|M|90|0.5|20|0.1|20
Miel Hacendado|M|330|0.3|82|0|15
Tomate frito Hacendado|M|75|1.5|9|3.5|50
Tomate triturado Hacendado|M|26|1.2|3.8|0.2|100
Gazpacho Hacendado|M|40|0.8|4|2.2|250
Salmorejo Hacendado|M|95|1.5|7|6.5|250
Ensalada mezcla bolsa Hacendado|M|20|1.5|2|0.3|100
Brócoli congelado Hacendado|M|30|3|3|0.4|200
Judías verdes congeladas Hacendado|M|28|1.7|4|0.2|200
Verduras para wok Hacendado|M|35|1.6|5|0.4|200
Espinacas congeladas Hacendado|M|25|2.8|1|0.5|200
Champiñones laminados|M|22|3|0.5|0.3|100
Tomate|M|20|0.9|3.5|0.2|150
Pepino|M|13|0.7|2|0.1|150
Pimiento rojo|M|31|1|6|0.3|150
Cebolla|M|40|1.1|9|0.1|100
Calabacín|M|17|1.2|3|0.3|200
Plátano|M|95|1.2|21|0.3|120
Manzana|M|52|0.3|12|0.2|180
Fresas|M|33|0.7|6|0.3|150
Arándanos|M|57|0.7|12|0.3|100
Naranja|M|45|0.9|9|0.1|180
Kiwi|M|61|1.1|12|0.5|100
Pizza fresca barbacoa Hacendado|M|240|10|28|9.5|200
Tortilla de patatas con cebolla Hacendado|M|160|5.5|12|10|150
Pechuga de pollo asada Hacendado|M|130|25|1|3|125
Ensalada de pasta con atún Hacendado|M|180|7|20|8|250
Croquetas jamón Hacendado|M|200|6|22|10|100
Galletas digestive Hacendado|M|480|7|64|21|30
Cereales Corn Flakes Hacendado|M|380|7|84|0.9|40
Muesli crunchy Hacendado|M|440|9|64|15|40
Coca-Cola Zero / refresco zero|M|0.4|0|0|0|330
Cerveza|M|42|0.4|3.4|0|330
Pechuga de pollo Lidl|L|110|23|0|1.8|150
Carne picada vacuno Lidl|L|205|19|0|14|125
Salmón ahumado Lidl|L|180|22|0|10|50
Atún al natural Nixe (escurrido)|L|105|25|0|0.8|56
Atún en aceite de oliva Nixe (escurrido)|L|195|26|0|10|56
Caballa en aceite Nixe|L|240|21|0|17|60
Pavo en lonchas Dulano|L|100|20|1.5|1.5|60
Jamón cocido Dulano|L|110|19|1|3.5|60
Huevos camperos Lidl (unidad 60 g)|L|143|12.6|0.7|9.9|60
Skyr natural Milbona|L|63|11|4|0.2|150
Yogur griego Milbona|L|120|5.5|4.5|9.5|125
Yogur proteínas High Protein Milbona|L|68|10|5|0.5|200
Pudding High Protein Milbona|L|75|10|6.5|1.3|200
Batido High Protein Milbona|L|65|8|6|1|250
Queso fresco batido 0% Milbona|L|47|8|3.5|0.2|250
Cottage cheese Milbona|L|95|11|3|4.3|100
Mozzarella Milbona|L|235|17|1|18|62
Queso Gouda lonchas Milbona|L|360|25|0|29|20
Leche semidesnatada Milbona|L|46|3.1|4.7|1.6|250
Bebida de avena Vemondo|L|45|0.5|7|1.5|250
Tofu natural Vemondo|L|125|13|1.5|7.5|100
Copos de avena Crownfield|L|370|13.5|58|7|50
Arroz largo Golden Sun (crudo)|L|350|7|78|0.6|80
Pasta Combino (cruda)|L|355|12|71|1.5|80
Pan de molde integral Rustikal|L|250|10|42|3.5|30
Tortitas de arroz Snack Day|L|385|8|80|3|8
Wraps de trigo Deluxe/Lidl|L|300|8.5|51|6.5|60
Garbanzos cocidos Lidl|L|115|7|13|2.5|200
Lentejas cocidas Lidl|L|90|7|12|0.5|200
Hummus Chef Select|L|290|7|11|24|30
Crema de cacahuete Alesto|L|615|26|13|49|15
Almendras Alesto|L|610|25|7|52|25
Mix frutos secos Alesto|L|600|20|12|51|25
Proteína whey Crivit|L|390|75|7|6|30
Barrita proteína Crivit|L|350|32|30|10|45
Aceite de oliva virgen extra Primadonna|L|884|0|0|100|10
Verduras salteado Freshona|L|35|1.6|5|0.4|200
Brócoli congelado Freshona|L|30|3|3|0.4|200
Gnocchi Italiamo|L|160|4|33|0.8|150
Pizza Trattoria Alfredo|L|230|9|28|9|200
Chocolate negro 85% Fin Carré|L|590|11|19|50|20
Granola Crownfield|L|450|9|62|17|40
Arroz blanco cocido (genérico)|G|130|2.7|28|0.3|150
Pasta cocida (genérico)|G|155|5.5|30|0.9|180
Patata cocida (genérico)|G|85|2|18|0.1|200
Pollo a la plancha (genérico)|G|165|31|0|3.6|150
Huevo frito (genérico)|G|196|13.6|0.8|15|50
Paella de marisco (genérico)|G|160|8|21|5|300
Lentejas estofadas (genérico)|G|110|7|14|3|300
Ensalada mixta (genérico)|G|60|2|4|4|200
`.trim().split("\n").map(l=>{const a=l.split("|");return{n:a[0],s:a[1],k:+a[2],p:+a[3],c:+a[4],f:+a[5],g:+a[6]}});

// Ideas: [objetivo d/v/m, comida|cena, título, P, C, G, ingredientes, pasos] (kcal = 4P+4C+9G)
const IDEAS_RAW = `
d|comida|Pizza crujiente de wrap con pollo BBQ|40|48|12|1 wrap grande · 50 g tomate frito · 40 g mozzarella rallada · 100 g pollo asado · 1/4 cebolla roja · 1 cda salsa barbacoa|Tuesta el wrap 3 min en horno o airfryer a 200º. Unta tomate, añade pollo desmenuzado con la barbacoa, cebolla y queso. Hornea 6-8 min hasta que gratine.
d|comida|Tacos de pollo al pastor con piña|42|50|11|3 tortillas de maíz/trigo pequeñas · 150 g pechuga de pollo · 80 g piña · cebolla, cilantro, lima · pimentón, comino, orégano|Marina el pollo en tiras con especias, zumo de piña y lima. Dóralo a fuego fuerte con dados de piña. Sirve en tortillas calientes con cebolla y cilantro.
d|comida|Fajitas de ternera con pimientos|40|45|13|150 g filete de ternera en tiras · pimiento rojo y verde · cebolla · 2 wraps · 30 g queso fresco 0% · especias fajitas|Saltea ternera a fuego alto 2 min y reserva. Pocha pimientos y cebolla con las especias, junta todo. Rellena los wraps con un toque de queso batido como "sour cream".
d|comida|Bowl de patatas asadas, pollo y salsa de yogur-ajo|45|50|10|250 g patata · 150 g pollo · 100 g yogur proteínas · ajo, limón, eneldo · rúcula · pimentón|Patata en dados con pimentón 20 min en airfryer a 200º. Pollo a la plancha con especias. Mezcla yogur, ajo rallado y limón. Monta sobre rúcula.
d|comida|Burger bowl con patatas y salsa burger|42|45|14|150 g picada de vacuno · 200 g patata · lechuga, tomate, pepinillos, cebolla · 20 g queso light · salsa: yogur + mostaza + kétchup zero|Patata en gajos al airfryer. Haz la carne aplastada a la plancha con el queso encima. Corta todo en bowl con lechuga, pepinillo y la salsa.
d|comida|Poke de atún y mango|38|55|9|60 g arroz (crudo) · 2 latas atún natural · 80 g mango · 60 g edamame · pepino · salsa soja, sésamo|Cuece el arroz y aliña con un chorrito de vinagre. Coloca encima atún, mango, edamame y pepino. Aliña con soja y sésamo.
d|comida|Pasta cremosa de pollo y champiñones|48|55|8|70 g pasta · 130 g pollo · 150 g champiñones · 100 g queso batido 0% · ajo, parmesano 5 g|Cuece la pasta. Dora pollo y champiñones con ajo. Apaga el fuego, añade queso batido y un poco de agua de la pasta. Mezcla y espolvorea parmesano.
d|comida|Arroz frito con gambas y huevo|35|55|10|60 g arroz · 150 g gambas · 1 huevo · guisantes, zanahoria, cebolleta · salsa soja|Usa arroz cocido frío. Saltea verduras y gambas, aparta, cuaja el huevo revuelto, añade el arroz y la soja a fuego fuerte.
d|comida|Kebab bowl de pollo|44|46|11|150 g contramuslo/pechuga · 50 g pan pita · lechuga, tomate, cebolla · 80 g yogur proteínas · comino, pimentón, ajo|Marina el pollo con especias y saltéalo bien dorado. Tuesta la pita en trozos. Monta con ensalada y salsa de yogur con ajo.
d|comida|Gnocchi al horno con pollo y tomate|38|58|10|180 g gnocchi · 100 g pollo · 150 g tomate triturado · albahaca · 30 g mozzarella|Saltea gnocchi hasta dorar. Mezcla con pollo y tomate en una fuente, cubre con mozzarella y gratina 8 min.
d|cena|Tacos de lechuga con picada mexicana|35|12|14|125 g picada de vacuno · hojas de lechuga romana · pico de gallo · 30 g aguacate · comino, pimentón|Dora la carne con especias. Rellena hojas de lechuga con carne, pico de gallo y aguacate. Lima por encima.
d|cena|Mini pizzas de berenjena|28|14|12|1 berenjena · 60 g tomate frito · 50 g mozzarella · 60 g pavo/jamón · orégano|Corta rodajas gruesas, sal y hornea 10 min. Añade tomate, pavo y queso. Gratina 5 min con orégano.
d|cena|Quesadilla de pollo y espinacas|38|28|11|1 wrap · 100 g pollo · espinacas · 30 g queso rallado · 30 g queso fresco 0%|Saltea espinacas. Rellena medio wrap con pollo, espinacas y quesos, dobla y dora en sartén por ambos lados.
d|cena|Salmón teriyaki con brócoli|32|14|18|130 g salmón · 250 g brócoli · 1 cda soja · 1 cdta miel · jengibre, ajo, sésamo|Dora el salmón por la piel. Añade soja, miel y jengibre y glasea 1 min. Sirve con brócoli al vapor y sésamo.
d|cena|Hamburguesa de pollo en pan con ensalada|34|30|10|1 hamburguesa pollo · 1 pan burger · lechuga, tomate, cebolla · mostaza y kétchup zero|Plancha la hamburguesa, tuesta el pan y monta con verduras y salsas. Acompaña de ensalada.
d|cena|Shakshuka con pan|24|24|14|2 huevos · 200 g tomate triturado · pimiento, cebolla · 40 g pan · comino, pimentón|Sofríe pimiento y cebolla, añade tomate y especias 8 min. Haz huecos, casca los huevos, tapa 5 min. Moja con pan.
d|cena|Gambas al ajillo con espaguetis de calabacín|30|8|12|200 g gambas · 1 calabacín en espiral · 2 ajos · guindilla · 1 cda AOVE · perejil|Dora ajo y guindilla, añade gambas 2 min, incorpora el calabacín 1 min. Perejil y limón.
d|cena|Fajitas de pollo en lechuga con guacamole|36|14|12|150 g pollo · pimientos y cebolla · 40 g guacamole · lechuga|Saltea el pollo con pimientos y especias fajitas. Sirve en hojas de lechuga con guacamole.
d|cena|Crema de calabaza + tosta de jamón|24|35|9|300 ml crema calabaza · 40 g pan · 40 g jamón serrano · tomate rallado|Calienta la crema. Tuesta el pan con tomate y jamón por encima.
d|cena|Tortitas proteicas de avena con fresas|35|40|8|40 g avena · 2 claras + 1 huevo · 100 g queso batido 0% · 150 g fresas · canela|Tritura avena, huevos y canela. Haz tortitas en sartén antiadherente. Cubre con queso batido y fresas.
v|comida|Pizza casera con pollo, jamón y mozzarella (½ pizza)|50|95|24|½ masa fresca de pizza · 80 g tomate · 80 g mozzarella · 100 g pollo · 40 g jamón cocido · orégano|Extiende la masa, cubre con tomate, toppings y queso. Horno a 230º 12-14 min.
v|comida|Burrito XXL de ternera, arroz y frijoles|55|100|22|1 tortilla XL · 150 g ternera · 60 g arroz · 100 g alubias · 30 g queso · pico de gallo · 30 g guacamole|Saltea la ternera con especias. Rellena la tortilla con arroz, alubias, carne, queso y salsas. Enrolla y dórala en sartén.
v|comida|Crispy potato bowl con carne y huevo|52|80|28|350 g patata · 130 g picada vacuno · 1 huevo · pimiento · cebolla · salsa brava light|Patata en dados crujiente en airfryer. Saltea carne con pimiento y cebolla. Monta con huevo frito en sartén antiadherente y brava.
v|comida|Tacos de cerdo desmechado x4|50|85|22|4 tortillas · 180 g lomo de cerdo · cebolla morada encurtida · piña · salsa chipotle ligera|Cocina el lomo con achiote o pimentón, zumo de naranja y ajo 25 min tapado. Desmecha y sirve en tortillas con cebolla y piña.
v|comida|Pasta carbonara proteica|55|95|22|120 g espaguetis · 2 huevos + 1 clara · 60 g bacon/jamón en taquitos · 20 g parmesano · pimienta|Dora el bacon. Bate huevos con parmesano. Mezcla la pasta caliente fuera del fuego con el huevo y un poco de agua de cocción.
v|comida|Pollo al curry con coco y arroz|50|100|18|180 g pollo · 110 g arroz basmati · 100 ml leche de coco light · cebolla · curry, jengibre|Pocha cebolla, dora el pollo, añade curry y leche de coco 10 min. Sirve con arroz.
v|comida|Smash burger con patatas gajo|50|85|30|2 smash de 75 g vacuno · pan brioche · queso cheddar loncha · pepinillos · 200 g patatas gajo · salsa burger|Aplasta bolas de carne en plancha muy caliente, queso encima. Monta en pan tostado. Patatas al airfryer.
v|comida|Poke de salmón, edamame y arroz|45|90|28|100 g arroz · 130 g salmón · 80 g edamame · aguacate · pepino · mango · soja|Arroz cocido con vinagre. Salmón en dados (o a la plancha). Monta todo y aliña con soja y sésamo.
v|comida|Fajitas de pollo x4 con queso y guacamole|55|85|25|4 wraps · 200 g pollo · pimientos, cebolla · 30 g queso rallado · 40 g guacamole|Saltea el pollo con especias y verduras. Calienta los wraps, rellena y añade queso y guacamole.
v|comida|Lasaña rápida de carne|50|80|28|6 láminas lasaña · 150 g picada · 150 g tomate · 50 g mozzarella · bechamel light 80 g|Haz boloñesa. Alterna láminas precocidas, boloñesa y bechamel. Cubre de queso, horno 25 min a 190º.
v|cena|Quesadillas de pollo y queso x2|50|60|20|2 wraps · 150 g pollo · 50 g queso rallado · pimiento · salsa de yogur|Rellena, dobla y dora en sartén. Corta en triángulos y moja en la salsa.
v|cena|Pizza wrap doble de atún y huevo|45|55|20|2 wraps · tomate frito · 1 lata atún · 1 huevo cocido · 40 g mozzarella · aceitunas|Monta dos pizzas de wrap con toppings y gratina 8 min a 200º.
v|cena|Gnocchi con boloñesa|40|80|18|250 g gnocchi · 120 g picada · 150 g tomate triturado · parmesano|Haz salsa boloñesa rápida. Saltea los gnocchi y mezcla con la salsa.
v|cena|Bocadillo de pollo crispy al horno|48|70|14|120 g pan · 150 g pechuga · 20 g corn flakes triturados · 1 huevo · lechuga, tomate · mayonesa light|Reboza el pollo en huevo y corn flakes, airfryer 12 min. Monta el bocata con ensalada y mayonesa light.
v|cena|Tortilla de patatas proteica + ensalada|38|55|22|300 g patata · 2 huevos + 150 g claras · cebolla · 10 g AOVE · ensalada|Cuece/airfryer la patata con cebolla. Mezcla con huevos y cuaja en sartén antiadherente.
v|cena|Overnight oats de chocolate y cacahuete|42|75|16|70 g avena · 30 g whey chocolate · 250 ml leche · 1 plátano · 15 g crema de cacahuete|Mezcla avena, whey y leche, deja en nevera. Sirve con plátano y crema de cacahuete.
v|cena|Tacos de gambas con salsa yogur-lima x3|42|60|16|3 tortillas · 200 g gambas · col lombarda · yogur, lima · aguacate|Saltea gambas con pimentón y ajo. Monta en tortillas con col y salsa de yogur-lima.
v|cena|Fried rice de ternera|42|80|18|100 g arroz · 130 g ternera · huevo · guisantes, cebolleta · soja|Saltea ternera a fuego fuerte, añade verduras, huevo y arroz frío con soja.
v|cena|Salmón, boniato y aguacate|40|55|28|150 g salmón · 300 g boniato · 50 g aguacate · ensalada|Boniato asado 25 min, salmón al horno 12 min. Sirve con aguacate y ensalada.
v|cena|Nachos caseros con carne al horno|42|60|25|2 wraps cortados en triángulos · 120 g picada · 60 g alubias · 40 g queso · pico de gallo · jalapeños|Hornea los triángulos hasta crujir. Cubre con carne especiada, alubias y queso, gratina y añade pico de gallo.
m|comida|Pizza fina margarita con pollo (½ pizza)|42|70|18|½ base fina · tomate · 60 g mozzarella · 100 g pollo · albahaca|Base con tomate, pollo y queso. Horno a 230º 10 min y albahaca al salir.
m|comida|Tacos de ternera con pico de gallo x3|42|60|18|3 tortillas · 150 g ternera · tomate, cebolla, cilantro, lima · 30 g aguacate|Saltea ternera con comino y pimentón. Pico de gallo picado fino. Monta y lima.
m|comida|Bowl mediterráneo de patata, pollo y feta|42|55|20|250 g patata · 140 g pollo · 30 g feta · tomate, pepino, aceitunas · orégano|Patata asada, pollo a la plancha. Monta con ensalada griega, feta y orégano.
m|comida|Fajitas de pollo y pimiento x3|45|58|16|3 wraps · 170 g pollo · pimientos, cebolla · queso batido · 30 g guacamole|Saltea pollo y verduras con especias. Rellena wraps con salsas.
m|comida|Pasta pesto con pollo y cherry|45|70|18|85 g pasta · 130 g pollo · 20 g pesto · tomates cherry · rúcula|Cuece pasta, saltea pollo y cherry, mezcla con pesto y un poco de agua de cocción.
m|comida|Arroz tres delicias con pollo|40|70|14|80 g arroz · 140 g pollo · huevo · guisantes, zanahoria, jamón york · soja|Arroz frío salteado con verduras, huevo, pollo y soja.
m|comida|Burger casera con patatas airfryer|42|65|20|pan brioche · 130 g picada vacuno · loncha queso · lechuga, tomate · 150 g patata|Burger a la plancha con queso, pan tostado. Patatas en bastones al airfryer.
m|comida|Poke de pollo teriyaki|42|68|14|80 g arroz · 140 g pollo · salsa teriyaki · edamame · zanahoria, pepino · sésamo|Glasea el pollo con teriyaki. Monta sobre arroz con verduras y sésamo.
m|comida|Lentejas estofadas con pavo y verduras|35|60|12|300 g lentejas cocidas · 80 g pavo/chorizo de pavo · zanahoria, pimiento, cebolla · pimentón|Sofríe verduras y pavo, añade pimentón, lentejas y agua 10 min.
m|comida|Kebab casero en pan pita|42|62|16|1 pan pita · 150 g pollo · lechuga, tomate, cebolla · salsa yogur-ajo · pimentón, comino|Saltea pollo especiado en tiras, rellena la pita con ensalada y salsa.
m|cena|Pizza de wrap con jamón y champiñones|35|45|15|1 wrap · tomate · 50 g mozzarella · 60 g jamón cocido · champiñones|Monta y hornea 8 min a 200º hasta gratinar.
m|cena|Quesadilla de pavo y queso|36|42|14|2 wraps pequeños · 80 g pavo · 40 g queso rallado · pimiento asado|Rellena, dobla y dora en sartén por ambos lados.
m|cena|Tacos de merluza crujiente x3|36|48|12|3 tortillas · 180 g merluza · pan rallado · col · salsa yogur-lima|Reboza la merluza en pan rallado y airfryer 10 min. Monta con col y salsa.
m|cena|Patatas revolconas con huevo poché|24|45|16|250 g patata · 1 huevo · pimentón · ajo · 10 g AOVE · 30 g jamón|Machaca patata cocida con pimentón y ajo frito. Corona con huevo poché y jamón.
m|cena|Salmón con patata y espárragos|34|35|20|130 g salmón · 200 g patata · espárragos trigueros · limón|Todo al horno 20 min a 200º, salmón los últimos 12 min.
m|cena|Tortilla de calabacín + pan con tomate|28|35|17|2 huevos + 100 g claras · calabacín · cebolla · 60 g pan · tomate rallado|Pocha calabacín y cebolla, cuaja la tortilla. Pan tostado con tomate.
m|cena|Hamburguesa de pollo con boniato|36|40|14|1 hamburguesa pollo · 200 g boniato · ensalada|Boniato en bastones al airfryer, hamburguesa a la plancha, ensalada.
m|cena|Wok de ternera con fideos|36|45|12|130 g ternera · 50 g fideos de arroz · verduras wok · soja, jengibre|Saltea ternera a fuego fuerte, verduras, fideos hidratados y soja.
m|cena|Huevos rotos con patata y jamón|30|40|20|250 g patata airfryer · 2 huevos · 40 g jamón serrano|Patata en láminas al airfryer, huevos fritos encima y jamón. Rompe y mezcla.
m|cena|Crepes de avena con pollo y queso|38|40|12|40 g avena · 1 huevo + 100 g claras · 100 g pollo · 30 g queso · espinacas|Tritura avena y huevos, haz 2 crepes. Rellena con pollo, espinacas y queso y dóralos.
`.trim().split("\n").map(l=>{const a=l.split("|"),p=+a[3],c=+a[4],f=+a[5];return{o:a[0],t:a[1],n:a[2],p,c,f,k:Math.round((4*p+4*c+9*f)/5)*5,i:a[6],s:a[7]}});
