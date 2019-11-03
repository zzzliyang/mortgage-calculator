-- Table: public.customer_data

-- DROP TABLE public.customer_data;

CREATE TABLE public.customer_data
(
    id integer NOT NULL DEFAULT nextval('customer_data_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default",
    contact character varying(100) COLLATE pg_catalog."default",
    preferred_type integer,
    preferred_amount double precision,
    status integer,
    created_time timestamp without time zone,
    CONSTRAINT customer_data_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.customer_data
    OWNER to postgres;