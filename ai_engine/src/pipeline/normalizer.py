TUNISIAN_MAP = {
    # verbs
    "a3tini": "donne moi",
    "aatini": "donne moi",
    "atini": "donne moi",

    "warini": "affiche",
    "nara": "voir",
    "nheb": "je veux",
    "lawej": "cherche",



    # questions
    "kadeh": "combien",
    "kaddeh": "combien",
    "9adeh": "combien",
    "9addeh": "combien",
    "chnouma": "quels sont",
    "chnowa": "quel est",
    "chneya": "quelle est",
    "win": "où",
    "wa9t": "quand",
    "kifeh": "comment",

    # conditions
    "elli": "qui",

    "akber men": "supérieur à",
    "asgher men": "inférieur à",
    "akther men": "plus de",
    "a9al men ": "moins de",

    "ahsen" : "le meilleur",
    "a7sen" : "le meilleur",
    "akhyeb" : "le pire",
    "akhyeb" : "le pire",

    "kima": "comme",
    "kif": "comme",

    "bin": "entre",

    #logic

    "wala": "ou",

    #time
    "taw": "maintenant",
    "9bal": "avant",
    "kbal": "avant",
    "baad": "après",
    "ba3d": "après",
    "3am": "année",
    "sna": "année",

    #AGGREGATIONS 
    "majmou3": "somme",
    "majmoue": "somme",

    "akber": "maximum",
    "asghar": "minimum",

    # entities
    "tlemdha": "étudiants",
    "telmidh": "étudiant",
    "taleb": "étudiant",
    "tolleb": "étudiants",

    "prof": "enseignant",
    "profs": "enseignants",

    "la3bed": "personnes",
    "laabed": "personnes",

    # misc
    "esm": "nom",
    "asemi": "les noms",
    
    # ORDERING / FILTERING
    "rateb": "trier",
    "ratteb": "trier",
    "lkol":"tout"

}


def normalize_question(question: str) -> str:
    q = question.lower()

    for tn, fr in TUNISIAN_MAP.items():
        q = q.replace(tn, fr)
    return q