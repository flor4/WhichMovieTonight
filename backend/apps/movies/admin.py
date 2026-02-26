from django.contrib import admin
from .models import Movie


# Custom admin configuration for the Movie model
@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'genre', 'release_date', 'streaming_platforms', 'created_at')
    list_filter = ('genre', 'release_date', 'netflix_available', 'disney_plus_available', 'prime_video_available')
    search_fields = ('title', 'synopsis', 'cast')
    date_hierarchy = 'release_date'
    ordering = ('-release_date',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Informations principales', {
            'fields': ('title', 'genre', 'release_date', 'synopsis')
        }),
        ('Casting', {
            'fields': ('cast',)
        }),
        ('Médias', {
            'fields': ('poster_url', 'backdrop_url', 'trailer_url')
        }),
        ('Disponibilité Streaming', {
            'fields': ('netflix_available', 'disney_plus_available', 'prime_video_available'),
            'description' : 'Indiquez sur quelles plateformes de streaming ce film est disponible.'
        }),
        ('Métadonnées', {
            'fields' : ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def streaming_platforms(self, obj):
        """Display available streaming platforms as a formatted string"""
        platforms = []
        if obj.netflix_available:
            platforms.append('\U0001F534 Netflix')
        if obj.disney_plus_available:
            platforms.append('\U0001F535 Disney+')
        if obj.prime_video_available:
            platforms.append('\U0001F537 Prime')
        return ', '.join(platforms) if platforms else '\u274C Aucune'
    streaming_platforms.short_description = 'Streaming'