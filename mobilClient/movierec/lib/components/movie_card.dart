import 'package:flutter/material.dart';
import 'package:movierec/model/recommend_result.dart';

class MovieCard extends StatelessWidget {
  final RecommendResult movie;

  const MovieCard({super.key, required this.movie});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 300,
      child: Card(
        margin: const EdgeInsets.all(8.0),
        elevation: 5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            // LEFT — Poster Image
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(12),
              ),
              child: SizedBox(
                width: 120, // 🔥 Image width
                height: double.infinity,
                child:
                    movie.poster ??
                    Image.network(movie.posterUrl, fit: BoxFit.cover),
              ),
            ),

            // RIGHT — Text content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      movie.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 6),

                    // Release date
                    Text(
                      'Release: ${movie.releaseDate.toLocal().toIso8601String().split('T')[0]}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),

                    const SizedBox(height: 10),

                    // Genres chips (scrollable horizontally)
                    SizedBox(
                      height: 26,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: movie.genres
                            .map(
                              (genre) => Padding(
                                padding: const EdgeInsets.only(right: 6),
                                child: Chip(
                                  label: Text(
                                    genre,
                                    style: const TextStyle(fontSize: 10),
                                  ),
                                  visualDensity: VisualDensity.compact,
                                  materialTapTargetSize:
                                      MaterialTapTargetSize.shrinkWrap,
                                  backgroundColor: Colors.blue.shade100,
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Overview (fills remaining vertical space)
                    Expanded(
                      child: Text(
                        movie.overview,
                        maxLines: 6,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
