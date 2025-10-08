import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from urllib.parse import urljoin
import re

class CFBPlayerScraper:
    def __init__(self, base_url='https://cfbstats.com/2025/player/index.html'):
        self.base_url = base_url
        self.base_domain = 'https://cfbstats.com'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.all_players = []
        
    def fetch_page(self, url):
        """Fetch and parse a page"""
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def extract_links_from_page(self, soup, base_url):
        """Extract relevant links from page"""
        links = set()
        
        if not soup:
            return links
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            # Only include links from the same domain
            if self.base_domain in full_url:
                links.add(full_url)
        
        return links
    
    def scrape_player_data_from_page(self, url):
        """Extract player data from a page with tables"""
        players = []
        soup = self.fetch_page(url)
        
        if not soup:
            return players
        
        # Find all tables
        tables = soup.find_all('table')
        
        for table in tables:
            # Try to find header row
            header_row = table.find('tr')
            if not header_row:
                continue
            
            headers = []
            header_cells = header_row.find_all(['th', 'td'])
            
            # Extract headers
            for cell in header_cells:
                header_text = cell.get_text(strip=True).lower()
                headers.append(header_text)
            
            # Skip if this doesn't look like a player table
            if not any(keyword in ' '.join(headers) for keyword in ['name', 'player', 'pos', 'position']):
                continue
            
            # Process data rows
            rows = table.find_all('tr')[1:]  # Skip header
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                
                if len(cells) < 2:
                    continue
                
                player = {}
                
                # Map cells to headers
                for idx, cell in enumerate(cells):
                    if idx < len(headers):
                        key = headers[idx]
                        value = cell.get_text(strip=True)
                        player[key] = value
                        
                        # Extract player profile link
                        link = cell.find('a')
                        if link and 'href' in link.attrs and not player.get('profile_url'):
                            player['profile_url'] = urljoin(url, link['href'])
                
                if player:
                    player['source_url'] = url
                    players.append(player)
        
        return players
    
    def scrape_all_players(self):
        """Main scraping method - navigates through all pages"""
        print("Starting comprehensive scrape...")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Get main index page
        soup = self.fetch_page(self.base_url)
        
        if not soup:
            print("Failed to fetch index page")
            return None
        
        # Extract all links from index
        all_links = self.extract_links_from_page(soup, self.base_url)
        print(f"Found {len(all_links)} total links on index page")
        
        # Filter for likely player/team/conference pages
        player_pages = set()
        for link in all_links:
            # Look for patterns that suggest player data
            if any(pattern in link.lower() for pattern in ['/team/', '/conference/', '/player/', '/roster']):
                player_pages.add(link)
        
        print(f"Filtered to {len(player_pages)} potential player pages")
        print("-" * 60)
        
        # Try scraping the index page itself first
        print("\n1. Checking index page for player data...")
        players = self.scrape_player_data_from_page(self.base_url)
        self.all_players.extend(players)
        print(f"   Found {len(players)} players on index page")
        
        # Scrape each player page
        print(f"\n2. Scraping {len(player_pages)} sub-pages...")
        for idx, page_url in enumerate(player_pages, 1):
            print(f"   [{idx}/{len(player_pages)}] {page_url}")
            
            players = self.scrape_player_data_from_page(page_url)
            self.all_players.extend(players)
            
            if players:
                print(f"       ✓ Found {len(players)} players")
            
            # Rate limiting - be respectful
            time.sleep(0.5)
        
        print("\n" + "=" * 60)
        print(f"Scraping complete! Total players: {len(self.all_players)}")
        
        return self.all_players
    
    def save_to_csv(self, filename='cfb_players_2025.csv'):
        """Save scraped data to CSV"""
        if not self.all_players:
            print("No data to save")
            return None
        
        df = pd.DataFrame(self.all_players)
        
        # Remove duplicates based on player name and team
        if 'name' in df.columns:
            df = df.drop_duplicates(subset=['name', 'source_url'], keep='first')
        
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"\nData saved to: {filename}")
        print(f"Total unique players: {len(df)}")
        print(f"\nColumns: {list(df.columns)}")
        print(f"\nFirst few rows:")
        print(df.head(10))
        
        return df

def main():
    # Initialize scraper
    scraper = CFBPlayerScraper()
    
    # Scrape all player data
    players = scraper.scrape_all_players()
    
    # Save to CSV
    if players:
        df = scraper.save_to_csv()
        
        # Print summary statistics
        if df is not None:
            print("\n" + "=" * 60)
            print("SUMMARY STATISTICS")
            print("=" * 60)
            
            if 'height' in df.columns:
                print(f"Players with height data: {df['height'].notna().sum()}")
            if 'weight' in df.columns:
                print(f"Players with weight data: {df['weight'].notna().sum()}")
            if 'class' in df.columns or 'year' in df.columns:
                class_col = 'class' if 'class' in df.columns else 'year'
                print(f"\nClass breakdown:")
                print(df[class_col].value_counts())
    else:
        print("\nNo players found. The site structure may require manual inspection.")
        print("Tips:")
        print("1. Check if the site uses JavaScript to load data (may need Selenium)")
        print("2. Inspect the HTML structure manually")
        print("3. Check robots.txt and terms of service")

if __name__ == "__main__":
    main()