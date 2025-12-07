class SearchResult {
  String title;
  int score;
  DateTime releaseDate;

  SearchResult({
    required this.title,
    required this.score,
    required this.releaseDate,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      title: json["title"],
      score: json["score"],
      releaseDate: DateTime.parse(json["release_date"]),
    );
  }
}
