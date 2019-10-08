<?php
	mb_internal_encoding("UTF-8");
	try {
		require ("urm.php");
		if ($accessgranted == 'all') {
			echo '<!DOCTYPE html>';
			echo '<html lang="de">';
			echo '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
			echo '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">';
			echo '<meta name="apple-mobile-web-app-capable" content="yes">';
			echo '<meta name="mobile-web-app-capable" content="yes">';
			echo '<title>CoSI</title>';


			echo '<link rel="stylesheet" href="./css/style.css">';
			echo '<link rel="stylesheet" href="https://geofos.fhhnet.stadt.hamburg.de/lgv-config/css/fonts.css">';

			echo '</head>';
			echo '<body>';
			echo '<div class="lgv-container">';
			echo '<div id="loader"><img src="../../lgv-config/img/ajax-loader.gif"></div>';

			echo '<div id="dpidiv" style="height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;"></div>';
			echo '<div id="popup"></div>';
			echo '<nav id="main-nav" class="navbar navbar-default" role="navigation">';
				echo '<div class="container-fluid">';
					echo '<div id="navbarRow" class="row">';
						echo '<div class="navbar-header">';
							echo '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">';
								echo '<span class="sr-only">Navigation ein-/ausblenden</span>';
								echo '<span class="icon-bar"></span>';
								echo '<span class="icon-bar"></span>';
								echo '<span class="icon-bar"></span>';
							echo '</button>';
						echo '</div>';
						echo '<div class="collapse navbar-collapse">';
							echo '<ul class="nav-menu" id="root">';
							echo '</ul>';
						echo '</div>';
					echo '</div>';
				echo '</div>';
			echo '</nav>';
				echo '<div id="map"></div>';
			echo '</div>';
			echo '<script type="text/javascript" src="./js/masterportal.js"></script>';
			echo '</body>';
			echo '</html>';
		}
	}
	catch (exception $e){
		echo '<!DOCTYPE html>';
		echo '<html lang="de">';
		echo '<head>';
		echo '<meta charset="utf-8">';
		echo '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
		echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
		echo '<title>Geoportal CoSI</title>';
		echo '<h1>' . $firstname . " " . $lastname . ", " . $e->getMessage() . '</h1>';
		echo '</head>';
		echo '</html>';
	}
?>
