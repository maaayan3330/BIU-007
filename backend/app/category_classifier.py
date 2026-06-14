from sentence_transformers import SentenceTransformer, util

from app.DB.db_models import ToxicityCategory


embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


STRONG_RULES = {
    ToxicityCategory.LGBTQ: [
        # English
        "gay", "lesbian", "trans", "transgender", "lgbt", "lgbtq",
        "homosexual", "queer",

        # Hebrew
        "הומו", "הומואים", "לסבית", "לסביות", "טרנס", "טרנסים",
        "להטב", "להט״ב", "קהילה גאה", "קהילה הלהטבית",
    ],

    ToxicityCategory.APPEARANCE_AND_WEIGHT: [
        # English
        "fat", "ugly", "skinny", "obese", "weight", "body",
        "face", "appearance", "looks", "disgusting body",
        "lose weight", "too thin", "too skinny",

        # Hebrew
        "שמן", "שמנה", "שמנים", "שמנות",
        "מכוער", "מכוערת", "מכוערים", "מכוערות",
        "רזה", "רזים", "רזות",
        "משקל", "גוף", "הגוף", "פנים", "מראה",
        "נראה", "נראית", "נראים", "נראות",
        "לרדת במשקל", "מגעיל", "מגעילה",
    ],

    ToxicityCategory.RELIGIOUS_DISCRIMINATION: [
        # English
        "muslim", "jew", "jewish", "christian", "religion",
        "religious", "orthodox", "haredi", "arab",

        # Hebrew
        "מוסלמי", "מוסלמים", "יהודי", "יהודים",
        "נוצרי", "נוצרים", "דת", "דתיים", "דתי",
        "חרדי", "חרדים", "ערבי", "ערבים",
    ],
}


CATEGORY_EXAMPLES = {
    ToxicityCategory.LGBTQ: [
        # English
        "I hate gay people",
        "gay people are disgusting",
        "trans people are weird",
        "lesbians are disgusting",
        "LGBTQ people should not exist",
        "homosexual people are sick",
        "you are disgusting because you are gay",
        "transgender people are not normal",
        "people like you ruin society because you are LGBTQ",
        "nobody should support the LGBTQ community",

        # Hebrew
        "אני שונא הומואים",
        "הומואים הם מגעילים",
        "לסביות הן מגעילות",
        "טרנסים הם לא נורמליים",
        "להטבים לא צריכים להתקיים",
        "אנשים מהקהילה הגאה מגעילים אותי",
        "אתה מגעיל כי אתה הומו",
        "את לסבית וזה דוחה",
        "אנשים מהקהילה הלהטבית הורסים את החברה",
        "לא צריך לתמוך בקהילה הלהטבית",
    ],

    ToxicityCategory.APPEARANCE_AND_WEIGHT: [
        # English
        "you are fat",
        "you are ugly",
        "your body is disgusting",
        "nobody wants to see your body",
        "you look terrible",
        "you are too skinny",
        "your face is ugly",
        "you should lose weight",
        "you look disgusting",
        "nobody would ever find you attractive",
        "your appearance is embarrassing",
        "you look like a monster",
        "your body looks awful",
        "your face looks disgusting",

        # Hebrew
        "אתה שמן",
        "את שמנה",
        "אתה מכוער",
        "את מכוערת",
        "הגוף שלך מגעיל",
        "אף אחד לא רוצה לראות את הגוף שלך",
        "אתה נראה נורא",
        "את נראית נורא",
        "אתה רזה מדי",
        "את רזה מדי",
        "הפנים שלך מכוערות",
        "את צריכה לרדת במשקל",
        "אתה צריך לרדת במשקל",
        "את נראית מגעיל",
        "אתה נראה מגעיל",
        "המראה שלך מביך",
        "אף אחד לא יימשך אליך",
        "הגוף שלך נראה רע",
        "הפנים שלך נראות מגעיל",
    ],

    ToxicityCategory.RELIGIOUS_DISCRIMINATION: [
        # English
        "I hate muslims",
        "I hate jews",
        "I hate christians",
        "religious people are stupid",
        "all muslims are terrorists",
        "all jews are evil",
        "christians are disgusting",
        "your religion is disgusting",
        "people from your religion are dangerous",
        "religious people ruin the country",
        "muslims should not be allowed here",
        "jews control everything",
        "christians are stupid",
        "orthodox people ruin society",

        # Hebrew
        "אני שונא מוסלמים",
        "אני שונא יהודים",
        "אני שונא נוצרים",
        "דתיים הם טיפשים",
        "חרדים הם מגעילים",
        "כל המוסלמים טרוריסטים",
        "כל היהודים רעים",
        "נוצרים הם מגעילים",
        "הדת שלך מגעילה",
        "אנשים מהדת שלך מסוכנים",
        "דתיים הורסים את המדינה",
        "מוסלמים לא צריכים להיות פה",
        "יהודים שולטים בהכל",
        "נוצרים טיפשים",
        "חרדים הורסים את המדינה",
        "ערבים מסוכנים",
    ],
}


CATEGORY_EMBEDDINGS = {
    category: embedding_model.encode(examples, convert_to_tensor=True)
    for category, examples in CATEGORY_EXAMPLES.items()
}


def classify_toxicity_category(text: str) -> ToxicityCategory:
    if not text or not text.strip():
        return ToxicityCategory.GENERAL

    text_lower = text.lower()

    # First: strong keyword/phrase rules.
    # This improves accuracy for short Hebrew/English comments.
    for category, keywords in STRONG_RULES.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                return category

    # Second: semantic similarity using multilingual sentence embeddings.
    comment_embedding = embedding_model.encode(text, convert_to_tensor=True)

    best_category = ToxicityCategory.GENERAL
    best_score = 0.0

    for category, embeddings in CATEGORY_EMBEDDINGS.items():
        similarity_scores = util.cos_sim(comment_embedding, embeddings)
        category_score = similarity_scores.max().item()

        if category_score > best_score:
            best_score = category_score
            best_category = category

    # Higher threshold prevents general toxic insults from being wrongly assigned
    # to LGBTQ / appearance / religion.
    if best_score < 0.50:
        return ToxicityCategory.GENERAL

    return best_category