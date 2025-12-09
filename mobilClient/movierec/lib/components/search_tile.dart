import 'package:flutter/material.dart';
import 'package:movierec/model/search_result.dart';

class SearchTile extends StatelessWidget {
  final SearchResult item;
  const SearchTile({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return ListTile(title: Text(item.title));
  }
}
