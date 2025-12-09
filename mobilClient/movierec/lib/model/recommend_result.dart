class RecommendResult {
  List<String> genres;
  int index;
  String overview;
  String posterUrl;
  DateTime releaseDate;
  String title;
  RecommendResult({
    required this.title,
    required this.releaseDate,
    required this.posterUrl,
    required this.overview,
    required this.index,
    required this.genres,
  });

  factory RecommendResult.fromJson(Map<String, dynamic> json) {
  return RecommendResult(
    title: json['title'] ?? '',
    releaseDate: DateTime.parse(json['release_date']),
    posterUrl: json['poster_url'] ?? '',
    overview: json['overview'] ?? '',
    index: json['index'] ?? 0,
    genres: (json['genres'] as String)
        .split(', ')
        .map((g) => g.trim())
        .where((g) => g.isNotEmpty)
        .toList(),
  );
}

}
