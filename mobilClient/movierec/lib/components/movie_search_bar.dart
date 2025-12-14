import 'dart:async';

import 'package:flutter/material.dart';
import 'package:movierec/API/mov_reqs.dart';
import 'package:movierec/components/search_tile.dart';
import 'package:movierec/model/search_result.dart';
import 'package:movierec/provider/recommendation_provider.dart';
import 'package:provider/provider.dart';

class MovieSearchBar extends StatefulWidget {
  const MovieSearchBar({super.key});

  @override
  State<MovieSearchBar> createState() => _MovieSearchBarState();
}

class _MovieSearchBarState extends State<MovieSearchBar> {
  List<SearchResult> results = [];
  bool isloading = false;
  Timer? _debounce;
  SearchController controller = SearchController();

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SearchAnchor.bar(
      onChanged: (value) async {
        var result = await Requests.searchFor(value);
        if (!mounted) return;
        setState(() {
          results = result;
          controller.openView();
        });
      },

      suggestionsBuilder: (context, controller) {
        if (results.isEmpty) {
          return [Center(child: Text("No matches found :("))];
        } else {
          return List<SearchTile>.generate(results.length, (index) {
            return SearchTile(
              item: results[index],
              onTap: () async {
                controller.closeView(results[index].title);
                var recomds = await Requests.getRecommendations(
                  results[index].title,
                );
                if (!context.mounted) return;
                Provider.of<RecommendationProvider>(
                  listen: false,
                  context,
                ).setMovies(recomds);
              },
            );
          });
        }
      },
    );
  }
}
