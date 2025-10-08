import requests
from bs4 import BeautifulSoup
import pandas as pd
from difflib import SequenceMatcher

def fuzzy_match_name(name1, name2, threshold=0.8):
    """Compare two names using fuzzy matching"""
    n1 = name1.lower().strip()
    n2 = name2.lower().strip()
    
    if n1 == n2:
        return True
    
    suffixes = [' jr.', ' jr', ' sr.', ' sr', ' iii', ' ii', ' iv']
    for suffix in suffixes:
        n1 = n1.replace(suffix, '')
        n2 = n2.replace(suffix, '')
    
    if n1 in n2 or n2 in n1:
        return True
    
    similarity = SequenceMatcher(None, n1, n2).ratio()
    return similarity >= threshold

def get_all_team_urls():
    """Returns dictionary of all FBS team roster URLs"""
    return {
        # SEC
        'alabama': 'https://rolltide.com/sports/football/roster',
        'arkansas': 'https://arkansasrazorbacks.com/sports/football/roster',
        'auburn': 'https://auburntigers.com/sports/football/roster',
        'florida': 'https://floridagators.com/sports/football/roster',
        'georgia': 'https://georgiadogs.com/sports/football/roster',
        'kentucky': 'https://ukathletics.com/sports/football/roster',
        'lsu': 'https://lsusports.net/sports/football/roster',
        'mississippi state': 'https://hailstate.com/sports/football/roster',
        'missouri': 'https://mutigers.com/sports/football/roster',
        'ole miss': 'https://olemisssports.com/sports/football/roster',
        'south carolina': 'https://gamecocksonline.com/sports/football/roster',
        'tennessee': 'https://utsports.com/sports/football/roster',
        'texas': 'https://texassports.com/sports/football/roster',
        'texas a&m': 'https://12thman.com/sports/football/roster',
        'vanderbilt': 'https://vucommodores.com/sports/football/roster',
        'oklahoma': 'https://soonersports.com/sports/football/roster',
        
        # Big Ten
        'illinois': 'https://fightingillini.com/sports/football/roster',
        'indiana': 'https://iuhoosiers.com/sports/football/roster',
        'iowa': 'https://hawkeyesports.com/sports/football/roster',
        'maryland': 'https://umterps.com/sports/football/roster',
        'michigan': 'https://mgoblue.com/sports/football/roster',
        'michigan state': 'https://msuspartans.com/sports/football/roster',
        'minnesota': 'https://gophersports.com/sports/football/roster',
        'nebraska': 'https://huskers.com/sports/football/roster',
        'northwestern': 'https://nusports.com/sports/football/roster',
        'ohio state': 'https://ohiostatebuckeyes.com/sports/football/roster',
        'penn state': 'https://gopsusports.com/sports/football/roster',
        'purdue': 'https://purduesports.com/sports/football/roster',
        'rutgers': 'https://scarletknights.com/sports/football/roster',
        'wisconsin': 'https://uwbadgers.com/sports/football/roster',
        'ucla': 'https://uclabruins.com/sports/football/roster',
        'usc': 'https://usctrojans.com/sports/football/roster',
        'oregon': 'https://goducks.com/sports/football/roster',
        'washington': 'https://gohuskies.com/sports/football/roster',
        
        # ACC
        'boston college': 'https://bceagles.com/sports/football/roster',
        'clemson': 'https://clemsontigers.com/sports/football/roster',
        'duke': 'https://goduke.com/sports/football/roster',
        'florida state': 'https://seminoles.com/sports/football/roster',
        'georgia tech': 'https://ramblinwreck.com/sports/football/roster',
        'louisville': 'https://gocards.com/sports/football/roster',
        'miami': 'https://hurricanesports.com/sports/football/roster',
        'miami (fl)': 'https://hurricanesports.com/sports/football/roster',
        'nc state': 'https://gopack.com/sports/football/roster',
        'north carolina': 'https://goheels.com/sports/football/roster',
        'pittsburgh': 'https://pittsburghpanthers.com/sports/football/roster',
        'syracuse': 'https://cuse.com/sports/football/roster',
        'virginia': 'https://virginiasports.com/sports/football/roster',
        'virginia tech': 'https://hokiesports.com/sports/football/roster',
        'wake forest': 'https://godeacs.com/sports/football/roster',
        'california': 'https://calbears.com/sports/football/roster',
        'stanford': 'https://gostanford.com/sports/football/roster',
        'smu': 'https://smumustangs.com/sports/football/roster',
        
        # Big 12
        'arizona': 'https://arizonawildcats.com/sports/football/roster',
        'arizona state': 'https://thesundevils.com/sports/football/roster',
        'baylor': 'https://baylorbears.com/sports/football/roster',
        'byu': 'https://byucougars.com/sports/football/roster',
        'cincinnati': 'https://gobearcats.com/sports/football/roster',
        'colorado': 'https://cubuffs.com/sports/football/roster',
        'houston': 'https://uhcougars.com/sports/football/roster',
        'iowa state': 'https://cyclones.com/sports/football/roster',
        'kansas': 'https://kuathletics.com/sports/football/roster',
        'kansas state': 'https://kstatesports.com/sports/football/roster',
        'oklahoma state': 'https://okstate.com/sports/football/roster',
        'tcu': 'https://gofrogs.com/sports/football/roster',
        'texas tech': 'https://texastech.com/sports/football/roster',
        'texas state': 'https://txstatebobcats.com/sports/football/roster',
        'ucf': 'https://ucfknights.com/sports/football/roster',
        'utah': 'https://utahutes.com/sports/football/roster',
        'west virginia': 'https://wvusports.com/sports/football/roster',
        
        # American Athletic
        'army': 'https://goarmywestpoint.com/sports/football/roster',
        'east carolina': 'https://ecupirates.com/sports/football/roster',
        'memphis': 'https://gotigersgo.com/sports/football/roster',
        'navy': 'https://navysports.com/sports/football/roster',
        'north texas': 'https://meangreensports.com/sports/football/roster',
        'rice': 'https://riceowls.com/sports/football/roster',
        'south florida': 'https://gousfbulls.com/sports/football/roster',
        'temple': 'https://owlsports.com/sports/football/roster',
        'tulane': 'https://tulanegreenwave.com/sports/football/roster',
        'tulsa': 'https://tulsahurricane.com/sports/football/roster',
        'uab': 'https://uabsports.com/sports/football/roster',
        'utsa': 'https://goutsa.com/sports/football/roster',
        'charlotte': 'https://charlotte49ers.com/sports/football/roster',
        'fau': 'https://fausports.com/sports/football/roster',
        
        # Mountain West
        'air force': 'https://goairforcefalcons.com/sports/football/roster',
        'boise state': 'https://broncosports.com/sports/football/roster',
        'colorado state': 'https://csurams.com/sports/football/roster',
        'fresno state': 'https://gobulldogs.com/sports/football/roster',
        'hawaii': 'https://hawaiiathletics.com/sports/football/roster',
        'nevada': 'https://nevadawolfpack.com/sports/football/roster',
        'new mexico': 'https://golobos.com/sports/football/roster',
        'san diego state': 'https://goaztecs.com/sports/football/roster',
        'san jose state': 'https://sjsuspartans.com/sports/football/roster',
        'unlv': 'https://unlvrebels.com/sports/football/roster',
        'utah state': 'https://utahstateaggies.com/sports/football/roster',
        'wyoming': 'https://gowyo.com/sports/football/roster',
        
        # Conference USA
        'florida international': 'https://fiusports.com/sports/football/roster',
        'jacksonville state': 'https://jsugamecocksports.com/sports/football/roster',
        'kennesaw state': 'https://ksuowls.com/sports/football/roster',
        'liberty': 'https://libertyflames.com/sports/football/roster',
        'louisiana tech': 'https://latechsports.com/sports/football/roster',
        'middle tennessee': 'https://goblueraiders.com/sports/football/roster',
        'new mexico state': 'https://nmstatesports.com/sports/football/roster',
        'sam houston': 'https://gobearkats.com/sports/football/roster',
        'utep': 'https://utepathletics.com/sports/football/roster',
        'western kentucky': 'https://wkusports.com/sports/football/roster',
        
        # Sun Belt
        'appalachian state': 'https://appstatesports.com/sports/football/roster',
        'arkansas state': 'https://astateredwolves.com/sports/football/roster',
        'coastal carolina': 'https://goccusports.com/sports/football/roster',
        'georgia southern': 'https://gseagles.com/sports/football/roster',
        'georgia state': 'https://georgiastatesports.com/sports/football/roster',
        'james madison': 'https://jmusports.com/sports/football/roster',
        'marshall': 'https://herdzone.com/sports/football/roster',
        'old dominion': 'https://odusports.com/sports/football/roster',
        'southern miss': 'https://southernmiss.com/sports/football/roster',
        'troy': 'https://troytrojans.com/sports/football/roster',
        'louisiana': 'https://ragincajuns.com/sports/football/roster',
        'ul monroe': 'https://ulmwarhawks.com/sports/football/roster',
        
        # Independent
        'notre dame': 'https://und.com/sports/football/roster',
        'uconn': 'https://uconnhuskies.com/sports/football/roster',
        'umass': 'https://umassathletics.com/sports/football/roster',
    }

def scrape_roster(team_url):
    """Scrape jersey numbers from team website"""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    try:
        response = requests.get(team_url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        roster_data = {}
        roster_rows = soup.find_all('tr')
        
        for row in roster_rows:
            try:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    number_text = cols[0].get_text(strip=True)
                    if number_text.isdigit():
                        number = number_text
                        
                        for col in cols[1:4]:
                            name_link = col.find('a')
                            if name_link:
                                name = name_link.get_text(strip=True)
                                if name and len(name) > 3:
                                    roster_data[name.lower()] = number
                                    break
            except:
                continue
                
        return roster_data
    except Exception as e:
        return {}

def update_jersey_numbers(csv_path='draft_eligible_players.csv'):
    """Main function to update jersey numbers"""
    print("Loading players CSV...")
    players_df = pd.read_csv(csv_path)
    
    team_urls = get_all_team_urls()
    
    # Find unique teams in CSV
    teams_to_scrape = set()
    for _, player in players_df.iterrows():
        team_name = player['team'].lower().strip()
        if team_name in team_urls:
            teams_to_scrape.add(team_name)
    
    print(f"\nFound {len(teams_to_scrape)} teams to scrape")
    print("This will take 5-15 minutes...\n")
    
    total_updated = 0
    
    for team in sorted(teams_to_scrape):
        print(f"Scraping {team}...")
        roster = scrape_roster(team_urls[team])
        
        team_players = players_df[players_df['team'] == team]
        updated = 0
        
        for idx, player in team_players.iterrows():
            player_name = player['name'].lower()
            
            # Try exact match
            if player_name in roster:
                players_df.at[idx, 'jersey_number'] = int(roster[player_name])
                print(f"  ✓ {player['name']}: #{roster[player_name]}")
                updated += 1
            else:
                # Try fuzzy matching
                for roster_name, number in roster.items():
                    if fuzzy_match_name(player_name, roster_name):
                        players_df.at[idx, 'jersey_number'] = int(number)
                        print(f"  ✓ {player['name']} → {roster_name}: #{number}")
                        updated += 1
                        break
        
        if updated == 0:
            print(f"  ⚠ No matches found")
        
        total_updated += updated
    
    # Save updated CSV
    output_file = 'draft_eligible_players_with_jerseys.csv'
    players_df.to_csv(output_file, index=False)
    
    print(f"\n{'='*60}")
    print(f"✓ Updated {total_updated} players with jersey numbers")
    print(f"✓ Saved to: {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    update_jersey_numbers()