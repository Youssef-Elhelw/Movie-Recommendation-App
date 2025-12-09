import 'package:flutter/material.dart';

class SearchTilePlaceholder extends StatelessWidget {
  const SearchTilePlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(width: 40, height: 40, color: Colors.grey.shade300),
      title: Container(height: 14, color: Colors.grey.shade300),
      subtitle: Container(
        margin: const EdgeInsets.only(top: 4),
        height: 12,
        color: Colors.grey.shade200,
      ),
    );
  }
}
