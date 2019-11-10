-- Table: public.customer_data

-- DROP TABLE public.customer_data;

CREATE TABLE public.customer_data
(
    id SERIAL,
    name character varying(100),
    contact character varying(100),
    preferred_type integer,
    preferred_amount double precision,
    status integer,
    created_time timestamp without time zone,
    CONSTRAINT customer_data_pkey PRIMARY KEY (id)
)

ALTER TABLE public.customer_data
    OWNER to postgres;