<?php
	/**
	 * Dieses Skript stellt eine Verbindung zur activedirectory.php her, die den Abgleich mit dem AD herstellt.
	 * Dort werden diverse Variablen aus dem AD ausgelesen und im PHP gesetzt. Hier erfolgt nun eine Auswertung
	 * dieser Variablen und eine Feststellung, welcher Nutzergruppe mit welchen Rechten der User zugeordnet ist.
	 */
	mb_internal_encoding("UTF-8");
	require ('../libs/php/activedirectory.php');
	evaluateuser();
	if (ismemberofgroup('CN=U-LGV-LGV_G31,OU=Universal,OU=Gruppen,OU=GV,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
		$accessgranted =  true;
	}
	elseif (ismemberofgroup('CN=U-LGV-LGV_G32,OU=Universal,OU=Gruppen,OU=GV,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
		$accessgranted =  true;
	}
	elseif (ismemberofgroup('CN=ROL-N-ITB-CoSI-Sprint,OU=Sondergruppen,OU=Groups,OU=N,OU=Bezirke,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
		$accessgranted =  true;
	}elseif (ismemberofgroup('CN=ROL-N-ITB-CoSI-Prod,OU=Sondergruppen,OU=Groups,OU=N,OU=Bezirke,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
		$accessgranted =  true;
	}
	else {
		throw new Exception ('Sie besitzen keine Berechtigung, um dieses Portal zu betreten.</br>Bitte wenden Sie sich an Ihren Administrator.');
		$accessgranted =  false;
	}
?>
