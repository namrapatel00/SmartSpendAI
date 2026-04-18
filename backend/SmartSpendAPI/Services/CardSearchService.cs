using System.Net;
using System.Text.RegularExpressions;
using SmartSpendAPI.DTOs;

namespace SmartSpendAPI.Services;

public class CardSearchService
{
    private readonly HttpClient _http;

    public CardSearchService(HttpClient http)
    {
        _http = http;
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 SmartSpendAI/1.0");
    }

    public async Task<List<CardSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<CardSearchResultDto>();

        var url = $"https://html.duckduckgo.com/html/?q={Uri.EscapeDataString(query + " credit card annual fee rewards")}";
        var html = await _http.GetStringAsync(url, cancellationToken);

        var pattern = "<a[^>]*class=\"result__a\"[^>]*href=\"(?<url>[^\"]+)\"[^>]*>(?<title>.*?)</a>(?:.|\\n|\\r)*?<a[^>]*class=\"result__snippet\"[^>]*>(?<snippet>.*?)</a>";
        var matches = Regex.Matches(html, pattern, RegexOptions.IgnoreCase);

        return matches
            .Take(8)
            .Select(m => new CardSearchResultDto(
                Clean(m.Groups["title"].Value),
                CleanUrl(m.Groups["url"].Value),
                Clean(m.Groups["snippet"].Value)
            ))
            .Where(r => !string.IsNullOrWhiteSpace(r.Title) && !string.IsNullOrWhiteSpace(r.Url))
            .ToList();
    }

    private static string Clean(string value)
    {
        var noTags = Regex.Replace(value, "<.*?>", string.Empty);
        return WebUtility.HtmlDecode(noTags).Trim();
    }

    private static string CleanUrl(string value)
    {
        var decoded = WebUtility.HtmlDecode(value);
        return decoded.StartsWith("//") ? $"https:{decoded}" : decoded;
    }
}
