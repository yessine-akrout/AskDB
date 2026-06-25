TABLE_KEYWORDS = {
    "Students": [
        "student",
        "students",
        "student name",
        "full name",
        "department",
        "average grade",
        "city",
        "enrollment year"
    ],

    "Instructors": [
        "instructor",
        "instructors",
        "teacher",
        "professor",
        "full name",
        "department",
        "hire year",
        "course instructor"
    ],

    "Courses": [
        "course",
        "courses",
        "subject",
        "module",
        "course name",
        "department",
        "credits",
        "instructor"
    ],

    "Enrollments": [
        "enrollment",
        "enrollments",
        "registration",
        "student course",
        "course enrollment",
        "grade",
        "year",
        "academic year"
    ]
}


def get_table_keywords(table_name: str) -> list[str]:
    return TABLE_KEYWORDS.get(table_name, [])