import 'dart:async';

import 'package:flutter/material.dart';
import 'package:movierec/API/mov_reqs.dart';
import 'package:movierec/components/search_tile.dart';
import 'package:movierec/components/search_tile_placeholder.dart';
import 'package:movierec/model/search_result.dart';

class MovieSearchBar extends StatefulWidget {
  MovieSearchBar({super.key});

  @override
  State<MovieSearchBar> createState() => _MovieSearchBarState();
}

class _MovieSearchBarState extends State<MovieSearchBar> {
  List<SearchResult> results = [];
  bool isloading = false;
  Timer? _debounce;

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
          isloading = false;
        });
      },

      suggestionsBuilder: (context, controller) {
        if (results.isEmpty) {
          return [Center(child: Text("No matches found :("))];
        } else {
          return List<SearchTile>.generate(results.length, (index) {
            return SearchTile(item: results[index]);
          });
        }
      },
    );
  }
}
