--
-- PostgreSQL database dump
--

-- Dumped from database version 14.3 (Debian 14.3-1.pgdg110+1)
-- Dumped by pg_dump version 14.3 (Debian 14.3-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cuota_tipopago_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cuota_tipopago_enum AS ENUM (
    'efectivo',
    'bcp',
    'interbank'
);


--
-- Name: usuario_rol_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usuario_rol_enum AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'TRABAJADOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id integer NOT NULL,
    dni character varying(8) NOT NULL,
    telefono character(9) NOT NULL,
    telefono2 character(9),
    cumple date,
    nombres character varying(100) NOT NULL,
    "creadoEn" timestamp without time zone NOT NULL,
    "actualizadoEn" timestamp without time zone NOT NULL,
    direccion character varying,
    "lugarNacimiento" character varying
);


--
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cliente_id_seq OWNED BY public.cliente.id;


--
-- Name: cuota; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cuota (
    id integer NOT NULL,
    cuota numeric(10,2) NOT NULL,
    "actualizadoEn" timestamp without time zone NOT NULL,
    "clienteId" integer,
    "creadoEn" timestamp without time zone NOT NULL,
    "tipoPago" public.cuota_tipopago_enum DEFAULT 'efectivo'::public.cuota_tipopago_enum NOT NULL
);


--
-- Name: cuota_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cuota_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cuota_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cuota_id_seq OWNED BY public.cuota.id;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    rol public.usuario_rol_enum DEFAULT 'TRABAJADOR'::public.usuario_rol_enum NOT NULL
);


--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: cliente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id SET DEFAULT nextval('public.cliente_id_seq'::regclass);


--
-- Name: cuota id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuota ALTER COLUMN id SET DEFAULT nextval('public.cuota_id_seq'::regclass);


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente (id, dni, telefono, telefono2, cumple, nombres, "creadoEn", "actualizadoEn", direccion, "lugarNacimiento") FROM stdin;
124	87604321	980004300	912045678	1975-04-07	Jemi Cortez	2025-06-26 10:01:36.231	2025-06-26 10:01:36.231	\N	\N
125	87604331	980034300	912045638	1975-04-14	Elio Cortez	2025-06-26 16:14:55.29	2025-06-26 16:14:55.29	\N	\N
126	43633212	987654110	654987741	2025-06-09	Julian	2025-06-27 08:36:22.815	2025-06-27 08:36:22.815	\N	\N
129	43555411	987412300	987852000	2025-06-22	Denis	2025-06-27 08:53:38.202	2025-06-27 08:53:59.344	\N	\N
122	43555698	994354019	987654321	1984-08-13	Abner Miguel Cortez Obregon 	2025-06-26 00:47:32.218	2025-06-30 11:49:28.988	Ruseñores 948	Lima
\.


--
-- Data for Name: cuota; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cuota (id, cuota, "actualizadoEn", "clienteId", "creadoEn", "tipoPago") FROM stdin;
120	70.00	2025-06-26 16:20:23.981	122	2025-06-26 16:20:23.981	interbank
124	200.00	2025-06-01 16:25:49.3	125	2025-06-01 16:25:49.3	bcp
123	400.00	2025-06-13 16:25:49.3	125	2025-06-13 16:25:49.3	interbank
122	100.00	2025-06-26 16:25:49.3	125	2025-06-26 16:25:49.3	efectivo
125	300.00	2025-06-27 08:37:52.229	125	2025-06-27 08:37:52.228	bcp
126	150.00	2025-06-27 08:49:41.37	126	2025-06-02 08:49:41.37	interbank
127	500.00	2025-06-27 08:51:42.22	126	2025-06-07 08:51:42.22	efectivo
132	32.00	2025-06-27 13:18:15.919	122	2025-06-27 13:18:15.919	interbank
134	130.00	2025-06-28 11:02:04.783	122	2025-06-28 11:02:04.783	interbank
135	23.00	2025-06-29 17:02:19.665	126	2025-06-29 17:02:19.664	efectivo
136	12.00	2025-06-29 17:28:38.046	122	2025-06-29 17:28:38.046	interbank
137	12.00	2025-06-30 10:02:52.887	122	2025-06-30 10:02:52.886	efectivo
138	55.00	2025-06-30 10:03:11.616	126	2025-06-30 10:03:11.615	efectivo
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario (id, username, password, rol) FROM stdin;
1	admin	$2a$12$porS.sEW8OMKyz9XKXe/M.llu3JsBqYmyc8weqwQBjQh1b/3pI8hu	SUPERADMIN
2	percy	$2a$12$JmbYUjn5U6Xsao/JXHkOqOZIEVifQKuua27Zj98eeJ3s/WBUt.TAe	ADMIN
3	trabajador	$2a$12$JNm9Qdc69W0yhax/C4ArPeMoU0YRun6Huxq95mCBuUlbFWeEco7A.	TRABAJADOR
\.


--
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cliente_id_seq', 161, true);


--
-- Name: cuota_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cuota_id_seq', 138, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_seq', 1, false);


--
-- Name: cliente PK_18990e8df6cf7fe71b9dc0f5f39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY (id);


--
-- Name: cuota PK_21216e076b96f35b05898b34902; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT "PK_21216e076b96f35b05898b34902" PRIMARY KEY (id);


--
-- Name: usuario PK_a56c58e5cabaa04fb2c98d2d7e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY (id);


--
-- Name: cliente UQ_251e72e84b60a37771db18f2c6d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "UQ_251e72e84b60a37771db18f2c6d" UNIQUE (dni);


--
-- Name: cliente UQ_46a3925c36d18aab92abaf32e7a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "UQ_46a3925c36d18aab92abaf32e7a" UNIQUE (telefono2);


--
-- Name: cliente UQ_667cad857c6aef522baf38404cd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "UQ_667cad857c6aef522baf38404cd" UNIQUE (nombres);


--
-- Name: usuario UQ_6ccff37176a6978449a99c82e10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT "UQ_6ccff37176a6978449a99c82e10" UNIQUE (username);


--
-- Name: cliente UQ_9935842e3b6d6ac472cac5916b2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "UQ_9935842e3b6d6ac472cac5916b2" UNIQUE (telefono);


--
-- Name: cuota FK_eb73db2ade44c00415e6011dfa0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT "FK_eb73db2ade44c00415e6011dfa0" FOREIGN KEY ("clienteId") REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

