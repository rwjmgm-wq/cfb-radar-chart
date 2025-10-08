import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
from difflib import SequenceMatcher

class DraftPlayerGameFinder:
    def __init__(self, csv_path):
        self.players_df = pd.read_csv(csv_path)
        self.players_df['team'] = self.players_df['team'].str.strip().str.lower()
        self.schedule = []
        
    def scrape_espn_schedule(self, week=None):
        if week:
            url = f"https://www.espn.com/college-football/schedule/_/week/{week}"
            print(f"Scraping ESPN schedule for Week {week}...")
        else:
            url = "https://www.espn.com/college-football/schedule"
            print("Scraping ESPN schedule for current week...")
            
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            date_sections = soup.find_all('div', class_='ScheduleTables')
            if not date_sections:
                date_sections = soup.find_all('div', class_='responsive-table-wrap')
            
            for section in date_sections:
                date_header = section.find('div', class_='Table__Title')
                if not date_header:
                    date_header = section.find('h2', class_='table-caption')
                
                game_date = date_header.text.strip() if date_header else 'Date TBD'
                games_table = section.find('tbody', class_='Table__TBODY')
                if not games_table:
                    games_table = section.find('tbody')
                
                if games_table:
                    game_rows = games_table.find_all('tr')
                    
                    for row in game_rows:
                        try:
                            teams = row.find_all('span', class_='Table__Team')
                            if len(teams) < 2:
                                team_links = row.find_all('a', class_='AnchorLink')
                                teams = [link for link in team_links if 'team' in link.get('href', '')]
                            
                            if len(teams) >= 2:
                                away_team = teams[0].text.strip() if hasattr(teams[0], 'text') else teams[0].get_text(strip=True)
                                home_team = teams[1].text.strip() if hasattr(teams[1], 'text') else teams[1].get_text(strip=True)
                                
                                time_cell = row.find('td', class_=lambda x: x and ('date' in x.lower() or 'time' in x.lower()))
                                if not time_cell:
                                    time_cell = row.find_all('td')[-1] if row.find_all('td') else None
                                
                                game_time = 'TBD'
                                tv_channel = 'TBD'
                                
                                if time_cell:
                                    time_text = time_cell.get_text(separator='|', strip=True)
                                    parts = time_text.split('|')
                                    
                                    for part in parts:
                                        part = part.strip()
                                        if any(x in part.upper() for x in ['PM', 'AM', 'ET', 'PT', 'CT', 'MT']):
                                            game_time = part
                                        elif part and (part.isupper() or any(net in part.upper() for net in ['ESPN', 'FOX', 'ABC', 'CBS', 'NBC'])):
                                            tv_channel = part
                                
                                self.schedule.append({
                                    'week': week if week else 'Current',
                                    'date': game_date,
                                    'time': game_time,
                                    'tv': tv_channel,
                                    'away_team': away_team,
                                    'home_team': home_team
                                })
                        except:
                            continue
                        
            print(f"✓ Found {len(self.schedule)} games")
            return True
        except Exception as e:
            print(f"Error scraping ESPN: {e}")
            return False
    
    def normalize_team_name(self, team_name):
        team_name = team_name.lower().strip()
        team_name = re.sub(r'^\d+\s+', '', team_name)
        
        protected_names = ['texas state', 'texas tech', 'texas a&m', 'arizona state', 'kansas state', 'oklahoma state', 'iowa state', 'michigan state', 'ohio state', 'penn state', 'florida state', 'nc state', 'boise state', 'colorado state', 'fresno state', 'san diego state', 'san jose state', 'utah state', 'arkansas state', 'georgia state', 'new mexico state', 'mississippi state', 'virginia tech', 'georgia tech', 'louisiana tech', 'appalachian state']
        
        if any(protected in team_name for protected in protected_names):
            return team_name
        
        team_name = re.sub(r'\s+(university|college)$', '', team_name)
        return team_name
    
    def find_matchups(self):
        matchups = []
        
        for game in self.schedule:
            away_norm = self.normalize_team_name(game['away_team'])
            home_norm = self.normalize_team_name(game['home_team'])
            
            away_players = self.players_df[self.players_df['team'] == away_norm]
            home_players = self.players_df[self.players_df['team'] == home_norm]
            
            if len(away_players) > 0 and len(home_players) > 0:
                matchups.append({
                    'date': game['date'],
                    'time': game['time'],
                    'tv': game.get('tv', 'TBD'),
                    'away_team': game['away_team'],
                    'home_team': game['home_team'],
                    'away_players': away_players,
                    'home_players': home_players
                })
        
        return matchups
    
    def display_matchups(self, matchups):
        print("\n" + "="*90)
        print(f"DRAFT-ELIGIBLE PLAYER MATCHUPS - {len(matchups)} games found")
        print("="*90)
        
        for i, matchup in enumerate(matchups, 1):
            print(f"\n{i}. {matchup['date']} @ {matchup['time']}")
            if matchup.get('tv') and matchup['tv'] != 'TBD':
                print(f"   TV: {matchup['tv']}")
            print(f"   {matchup['away_team']} @ {matchup['home_team']}")
            
            away_sorted = matchup['away_players'].copy()
            if 'draft_rank' in away_sorted.columns:
                away_sorted = away_sorted.sort_values('draft_rank', na_position='last')
            
            print(f"\n   {matchup['away_team']} Players:")
            for _, player in away_sorted.iterrows():
                number = f"#{int(player['jersey_number'])}" if 'jersey_number' in player and pd.notna(player['jersey_number']) and player['jersey_number'] != '' else ""
                rank = f"(Rank #{int(player['draft_rank'])})" if 'draft_rank' in player and pd.notna(player['draft_rank']) else "(Unranked)"
                print(f"      {number} {player['name']} - {player['position']} {rank}")
            
            home_sorted = matchup['home_players'].copy()
            if 'draft_rank' in home_sorted.columns:
                home_sorted = home_sorted.sort_values('draft_rank', na_position='last')
            
            print(f"\n   {matchup['home_team']} Players:")
            for _, player in home_sorted.iterrows():
                number = f"#{int(player['jersey_number'])}" if 'jersey_number' in player and pd.notna(player['jersey_number']) and player['jersey_number'] != '' else ""
                rank = f"(Rank #{int(player['draft_rank'])})" if 'draft_rank' in player and pd.notna(player['draft_rank']) else "(Unranked)"
                print(f"      {number} {player['name']} - {player['position']} {rank}")
            print("-" * 90)
    
    def save_matchups_to_file(self, matchups, filename='matchups_report.txt'):
        """Save matchups to a text file"""
        with open(filename, 'w') as f:
            f.write("DRAFT-ELIGIBLE PLAYER MATCHUPS\n")
            f.write("="*90 + "\n")
            
            for i, matchup in enumerate(matchups, 1):
                f.write(f"\n{i}. {matchup['date']} @ {matchup['time']}\n")
                if matchup.get('tv') and matchup['tv'] != 'TBD':
                    f.write(f"   TV: {matchup['tv']}\n")
                f.write(f"   {matchup['away_team']} @ {matchup['home_team']}\n")
                
                away_sorted = matchup['away_players'].copy()
                if 'draft_rank' in away_sorted.columns:
                    away_sorted = away_sorted.sort_values('draft_rank', na_position='last')
                
                f.write(f"\n   {matchup['away_team']} Players:\n")
                for _, player in away_sorted.iterrows():
                    number = f"#{int(player['jersey_number'])} " if 'jersey_number' in player and pd.notna(player['jersey_number']) and player['jersey_number'] != '' else ""
                    rank = f" (Rank #{int(player['draft_rank'])})" if 'draft_rank' in player and pd.notna(player['draft_rank']) else ""
                    f.write(f"      {number}{player['name']} - {player['position']}{rank}\n")
                
                home_sorted = matchup['home_players'].copy()
                if 'draft_rank' in home_sorted.columns:
                    home_sorted = home_sorted.sort_values('draft_rank', na_position='last')
                
                f.write(f"\n   {matchup['home_team']} Players:\n")
                for _, player in home_sorted.iterrows():
                    number = f"#{int(player['jersey_number'])} " if 'jersey_number' in player and pd.notna(player['jersey_number']) and player['jersey_number'] != '' else ""
                    rank = f" (Rank #{int(player['draft_rank'])})" if 'draft_rank' in player and pd.notna(player['draft_rank']) else ""
                    f.write(f"      {number}{player['name']} - {player['position']}{rank}\n")
                
                f.write("-" * 90 + "\n")
        
        print(f"\n✓ Report saved to {filename}")

if __name__ == "__main__":
    # Use the CSV with jersey numbers if it exists, otherwise use the original
    import os
    if os.path.exists('draft_eligible_players_with_jerseys.csv'):
        csv_file = 'draft_eligible_players_with_jerseys.csv'
        print("Using CSV with jersey numbers")
    else:
        csv_file = 'draft_eligible_players.csv'
        print("Using CSV without jersey numbers")
        print("Run jersey_scraper.py first to add jersey numbers\n")
    
    finder = DraftPlayerGameFinder(csv_file)
    finder.scrape_espn_schedule(week=6)
    matchups = finder.find_matchups()
    finder.display_matchups(matchups)
    finder.save_matchups_to_file(matchups)