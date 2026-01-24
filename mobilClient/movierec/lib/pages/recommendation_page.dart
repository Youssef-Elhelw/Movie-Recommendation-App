import 'package:flutter/material.dart';
import 'package:movierec/components/movie_card.dart';
import 'package:movierec/components/movie_search_bar.dart';
import 'package:movierec/provider/recommendation_provider.dart';
import 'package:provider/provider.dart';

class RecommendationPage extends StatelessWidget {
  const RecommendationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            children: [
              MovieSearchBar(),
              Expanded(
                child: Consumer<RecommendationProvider>(
                  builder: (context, value, child) {
                    if (value.movies.isEmpty) {
                      return Container(color: Colors.red);
                    }
                    return ListView.builder(
                      itemCount: value.movies.length,
                      itemBuilder: (context, index) {
                        return MovieCard(movie: value.movies[index]);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
