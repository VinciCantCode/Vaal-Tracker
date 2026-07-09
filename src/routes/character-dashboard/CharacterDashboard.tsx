import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import {
  Box,
  Grid,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useStores } from '../..';
import { externalService } from '../../services/external.service';
import { useStyles } from './CharacterDashboard.styles';

const CharacterDashboard = () => {
  const classes = useStyles();
  const { accountStore, uiStateStore } = useStores();
  const account = accountStore!.getSelectedAccount;

  useEffect(() => {
    if (!uiStateStore!.validated && !uiStateStore!.initiated && !uiStateStore!.isValidating) {
      accountStore!.validateSession('/character');
    }
  }, []);

  // Flatten all characters from all active leagues
  const allCharacters = account.accountLeagues.flatMap((al) => al.characters);

  const [selectedCharName, setSelectedCharName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set default active character from profile if available
  useEffect(() => {
    if (account.activeProfile?.activeCharacterName) {
      const profileChar = allCharacters.find(
        (c) => c.name === account.activeProfile!.activeCharacterName
      );
      if (profileChar) {
        setSelectedCharName(profileChar.name);
      } else if (allCharacters.length > 0) {
        setSelectedCharName(allCharacters[0].name);
      }
    } else if (allCharacters.length > 0) {
      setSelectedCharName(allCharacters[0].name);
    }
  }, [account.activeProfile?.activeCharacterName, allCharacters.length]);

  const selectedCharacter = allCharacters.find((c) => c.name === selectedCharName);

  const fetchCharacterDetails = async (charName: string) => {
    if (!charName) return;
    setLoading(true);
    setError(null);
    try {
      const response = await externalService.getCharacter(charName, 'poe2').toPromise();
      if (response && response.data?.character) {
        const charData = response.data.character;
        const leagueId = charData.league;
        const accountLeague = account.accountLeagues.find((al) => al.leagueId === leagueId);

        if (accountLeague) {
          const charInLeague = accountLeague.characters.find((c) => c.name === charName);
          if (charInLeague) {
            runInAction(() => {
              charInLeague.equipment = charData.equipment || [];
              charInLeague.inventory = charData.inventory || [];
              charInLeague.jewels = charData.jewels || [];
              charInLeague.passives = charData.passives;
            });
          }
        }
      }
    } catch (err: any) {
      console.error('[CharacterDashboard] Failed to fetch character:', err);
      setError('error:failed_to_fetch_character_data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedCharName &&
      selectedCharacter &&
      (!selectedCharacter.equipment || selectedCharacter.equipment.length === 0)
    ) {
      fetchCharacterDetails(selectedCharName);
    }
  }, [selectedCharName]);

  const getItemInSlot = (slot: string) => {
    return selectedCharacter?.equipment?.find((item) => item.inventoryId === slot);
  };

  const getRarityClass = (frameType: number) => {
    switch (frameType) {
      case 3:
        return classes.rarityUnique;
      case 2:
        return classes.rarityRare;
      case 1:
        return classes.rarityMagic;
      default:
        return classes.rarityNormal;
    }
  };

  const renderSlot = (slotName: string, displayLabel: string, extraClass: string = '') => {
    const item = getItemInSlot(slotName);
    if (!item) {
      return (
        <Box className={`${classes.equipSlot} ${extraClass}`}>
          <Typography className={classes.slotLabel}>{displayLabel}</Typography>
        </Box>
      );
    }

    return (
      <Tooltip
        classes={{ tooltip: classes.tooltipRoot }}
        placement="top"
        title={
          <Box>
            <Typography className={classes.tooltipName}>{item.name || item.typeLine}</Typography>
            {item.name && <Typography className={classes.tooltipType}>{item.typeLine}</Typography>}
            {item.implicitMods && item.implicitMods.length > 0 && (
              <Box mb={1} borderBottom="1px dashed rgba(255,255,255,0.15)" pb={1}>
                {item.implicitMods.map((mod, i) => (
                  <Typography key={i} className={classes.tooltipMod} style={{ color: '#8888ff' }}>
                    {mod}
                  </Typography>
                ))}
              </Box>
            )}
            {item.explicitMods && item.explicitMods.length > 0 && (
              <Box>
                {item.explicitMods.map((mod, i) => (
                  <Typography key={i} className={classes.tooltipMod}>
                    {mod}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        }
      >
        <Box className={`${classes.equipSlot} ${getRarityClass(item.frameType)} ${extraClass}`}>
          <img src={item.icon} alt={item.typeLine} className={classes.itemIcon} />
          <Typography className={classes.slotLabel}>{displayLabel}</Typography>
        </Box>
      </Tooltip>
    );
  };

  const isSupportGem = (gem: any) => {
    return (
      gem.category?.gems?.includes('support') ||
      gem.typeLine.endsWith(' Support') ||
      gem.typeLine.endsWith('辅助')
    );
  };

  const getSkillsFromEquipment = () => {
    const skillsList: Array<{ slot: string; activeGems: any[]; supportGems: any[] }> = [];
    selectedCharacter?.equipment?.forEach((item) => {
      if (item.socketedItems && item.socketedItems.length > 0) {
        const activeGems = item.socketedItems.filter((gem) => !isSupportGem(gem));
        const supportGems = item.socketedItems.filter((gem) => isSupportGem(gem));
        if (activeGems.length > 0) {
          skillsList.push({
            slot: item.inventoryId,
            activeGems,
            supportGems,
          });
        }
      }
    });
    return skillsList;
  };

  return (
    <Box className={classes.root}>
      {/* Upper header action controls */}
      <Box className={classes.header}>
        <Typography variant="h5" className={classes.title}>
          角色信息 / CHARACTER PANEL
        </Typography>
        <Box display="flex" alignItems="center">
          <Select
            size="small"
            className={classes.dropdown}
            value={selectedCharName}
            onChange={(e) => setSelectedCharName(e.target.value as string)}
            disabled={loading}
          >
            {allCharacters.map((char) => (
              <MenuItem key={char.name} value={char.name}>
                {char.name} ({char.class} - Lvl {char.level})
              </MenuItem>
            ))}
          </Select>
          <Button
            size="small"
            variant="outlined"
            className={classes.refreshBtn}
            onClick={() => fetchCharacterDetails(selectedCharName)}
            disabled={loading || !selectedCharName}
            startIcon={<RefreshIcon />}
          >
            {loading ? <CircularProgress size={16} /> : '刷新 / Refresh'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Box mb={2} color="error.main">
          <Typography>{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Left panel: Inventory Slot Grid */}
          <Grid item xs={12} md={6}>
            <Card className={classes.panelCard}>
              <Typography variant="h6" className={classes.sectionTitle}>
                装备面板 / Equipment
              </Typography>

              <Box className={classes.gridContainer}>
                {/* Row 1: Left-Weapon, Helmet, Right-Weapon */}
                {renderSlot('Weapon1', 'Main Hand', classes.slotWeapon1)}
                {renderSlot('Helmet', 'Helmet')}
                {renderSlot('Weapon2', 'Offhand', classes.slotWeapon2)}

                {/* Row 2: Amulet (helmet is in col 2 row 1, amulet is col 2 row 2) */}
                {renderSlot('Amulet', 'Amulet')}

                {/* Row 3: Gloves, Body-Armour, Boots */}
                {renderSlot('Gloves', 'Gloves')}
                {renderSlot('BodyArmour', 'Body Armour')}
                {renderSlot('Boots', 'Boots')}

                {/* Row 4: Ring-Left, Belt, Ring-Right */}
                {renderSlot('Ring1', 'Left Ring')}
                {renderSlot('Belt', 'Belt')}
                {renderSlot('Ring2', 'Right Ring')}
              </Box>

              {/* 5 Flask Slots */}
              <Box className={classes.flaskContainer}>
                {renderSlot('Flask1', 'Flask 1', classes.flaskSlot)}
                {renderSlot('Flask2', 'Flask 2', classes.flaskSlot)}
                {renderSlot('Flask3', 'Flask 3', classes.flaskSlot)}
                {renderSlot('Flask4', 'Flask 4', classes.flaskSlot)}
                {renderSlot('Flask5', 'Flask 5', classes.flaskSlot)}
              </Box>
            </Card>
          </Grid>

          {/* Right panel: Skills and Passives info */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3} direction="column">
              {/* Passives Count Panel */}
              <Grid item>
                <Card className={classes.panelCard}>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    天赋点统计 / Passive Skill Points
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography className={classes.passiveCountText}>
                      {selectedCharacter?.passives?.hashes?.length || 0} / 121
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" mb={2}>
                      已点亮天赋点数数目（Based on allocated node hashes）
                    </Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      href={`https://poe2.ninja/builds/char/${account.name}/${selectedCharName}`}
                      target="_blank"
                      startIcon={<SportsKabaddiIcon />}
                    >
                      在 poe2.ninja 中查看详情 / View Build on poe2.ninja
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* Socketed Gems Active Skills Panel */}
              <Grid item>
                <Card className={classes.panelCard}>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    技能插槽与连接 / Socketed Active Skills
                  </Typography>
                  <CardContent style={{ padding: 0 }}>
                    {getSkillsFromEquipment().length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        无装备插槽主动技能 / No active gems socketed
                      </Typography>
                    ) : (
                      getSkillsFromEquipment().map((skillGroup) => (
                        <Box key={skillGroup.slot} mb={2}>
                          <Typography
                            variant="subtitle2"
                            color="secondary"
                            style={{ textTransform: 'uppercase', marginBottom: '8px' }}
                          >
                            {skillGroup.slot}
                          </Typography>
                          {skillGroup.activeGems.map((gem: any) => (
                            <Box key={gem.id || gem.typeLine} className={classes.skillRow}>
                              <img src={gem.icon} alt={gem.typeLine} className={classes.gemIcon} />
                              <Box>
                                <Typography className={classes.gemName}>{gem.typeLine}</Typography>
                                {skillGroup.supportGems.length > 0 && (
                                  <Typography className={classes.supportName}>
                                    Linked:{' '}
                                    {skillGroup.supportGems
                                      .map((s: any) => s.typeLine.replace(' Support', ''))
                                      .join(', ')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default observer(CharacterDashboard);
