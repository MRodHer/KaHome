CREATE TABLE "cat_estados" (
  "idestado" smallint NOT NULL,
  "estado" varchar(31) NOT NULL,
  PRIMARY KEY ("idestado")
);

CREATE TABLE "cat_municipios" (
  "idmunicipio" integer NOT NULL,
  "idestado" smallint NOT NULL,
  "municipio" varchar(49) NOT NULL,
  PRIMARY KEY ("idmunicipio","idestado"),
  CONSTRAINT "fk_cat_municipios_cat_estados1" FOREIGN KEY ("idestado") REFERENCES "cat_estados" ("idestado")
);

CREATE TABLE "cat_cp" (
  "idcp" integer NOT NULL DEFAULT 0,
  "idmunicipio" integer NOT NULL,
  "idestado" smallint NOT NULL,
  "cp" integer NOT NULL,
  "colonia" varchar(60) NOT NULL,
  PRIMARY KEY ("idcp"),
  CONSTRAINT "fk_cat_cp_cat_estados1" FOREIGN KEY ("idestado") REFERENCES "cat_estados" ("idestado"),
  CONSTRAINT "fk_cat_cp_cat_municipios1" FOREIGN KEY ("idmunicipio", "idestado") REFERENCES "cat_municipios" ("idmunicipio", "idestado")
);