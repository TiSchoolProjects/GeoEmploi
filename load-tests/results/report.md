# Rapport de charge GéoEmploi

## Scénario

Outil : k6

Durée : 3m

Utilisateurs simultanés : 50

Répartition :

- liste des offres : 25 utilisateurs ;
- consultation de la carte : 25 utilisateurs.

Base testée :

- 501 offres ;
- 50 communes.

La carte charge la liste des offres ainsi que des tuiles servies par le proxy cartographique GéoEmploi.

Les tuiles sont préchargées avant la phase mesurée afin de mesurer principalement les performances de l'application locale et de son cache, plutôt que la latence du service IGN externe.

## Résultats

| Flux | Médiane | p95 | Taux d'erreur |
| --- | ---: | ---: | ---: |
| Liste des offres | 16.34 ms | 183.90 ms | 0.00 % |
| Données de la carte | 139.16 ms | 243.06 ms | 0.00 % |
| Tuiles cartographiques | 149.99 ms | 288.14 ms | 0.00 % |

Taux d'erreur global : **0.00 %**

## Première correction envisagée

La première ligne à examiner si les temps de réponse de la liste ou des données de carte sont élevés est la requête de `JobsService.findAll()` :

```
return this.jobRepository.find({
  where: {
    archivedAt: IsNull(),
  },
});
```

Cette route renvoie actuellement l'intégralité des offres actives à chaque consultation. Avec plusieurs centaines d'offres, chaque requête implique la lecture, la sérialisation et le transfert de tous les objets, y compris leurs descriptions.

La première optimisation envisagée serait donc de limiter les colonnes retournées pour la carte et/ou d'introduire de la pagination pour la liste des offres. Un cache applicatif peut ensuite être envisagé si nécessaire.

## Analyse

Le scénario de charge a été exécuté localement avec 50 utilisateurs
simultanés pendant 3 minutes sur une base contenant 501 offres réparties
sur 50 communes.

Le test a réalisé 4202 itérations complètes sans interruption.

Aucune erreur HTTP ou fonctionnelle n'a été relevée pendant le scénario,
soit un taux d'erreur global de 0 %.

La consultation de la liste des offres présente un temps de réponse médian
de 16,34 ms et un p95 de 183,90 ms.

La récupération des données nécessaires à la carte présente un temps
médian de 139,16 ms et un p95 de 243,06 ms.

Les tuiles cartographiques servies par le proxy GéoEmploi présentent un
temps médian de 149,99 ms et un p95 de 288,14 ms.

Pour la charge demandée, aucun problème de stabilité n'a donc été observé.
Les temps de réponse restent contenus, y compris au 95e percentile.

La différence entre la médiane de la liste et celle du scénario
cartographique s'explique notamment par une charge plus importante lors
de la consultation de la carte, qui récupère les données des offres ainsi
que plusieurs tuiles cartographiques.

