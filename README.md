# TypeScript: Ignore Leftmost Nullish Literal Errors
In Typescript v5.6.0, new errors are thrown for operands in nullish coalescing expressions that resolve to "always nullish" or "never nullish". For the most part this is very helpful and catches bugs. However, there are a few that write code in a different way that now have errors that can't be disabled.

This is node module which removes these diagnostic errors in both the TypeScript Language Server and compilation output (using [`ts-patch`](https://github.com/nonara/ts-patch)).

Here's some example code:
```ts
const partOfDay = game.time.getPartOfDay()
const sets = undefined
	// try granular part of day first
	?? group[partOfDay]
	// then check if the granular part of day is any part of nighttime, and if so try all night spawns
	?? (PartOfDay.AllNighttime & partOfDay ? group[PartOfDay.AllNighttime] : undefined)
	// then check if the granular part of day is any part of daytime, and if so try all day spawns
	?? (PartOfDay.AllDaytime & partOfDay ? group[PartOfDay.AllDaytime] : undefined)
	// fallback to all day spawns
	?? group[PartOfDay.Always]
	
if (!sets?.length)
	return []
```

# Why Would You Write Code Like This Oh My God
Every line in the above expression is formatted identically, which is good for comprehension, but unfortunately it requires `undefined` or `null` on the first line in order to have `??` on the first actually important line. For those who have used this way of writing code for a while, you eventually stop looking at the first line, and instead look at the relevant lines instead.

It's similar to the following:
```ts
const inRange = true
	&& x - treasureRange <= treasure.x && x + treasureRange >= treasure.x
	&& y - treasureRange <= treasure.y && y + treasureRange >= treasure.y
	&& z === map.position.z
```

And here's an even more complicated example of this kind of formatting being used for boolean expressions:
```ts
const shouldCancel = false
	|| !container
	|| this.sortingComponent?.item?.containedWithin !== container
	|| (true
		&& container !== localPlayer
		&& !localIsland.items.isContainableInContainer(container, localPlayer)
		&& !localIsland?.items.isContainableInAdjacentContainer(localPlayer, container))
```

Not only does this provide benefits to comprehension speed, by keeping conditions sorted in a way that's quicker to parse, but it also allows quickly adding or removing parts of a complicated check, and momentarily commenting out any of them in the exact same way.

This kind of formatting is common and considered idiomatic in SQL, but is not common in JavaScript or similar languages.

During the beta for TypeScript 5.6.0 I [reported `null ??` no longer working as a bug](https://github.com/microsoft/TypeScript/issues/59546) and [made a PR to fix it](https://github.com/microsoft/TypeScript/pull/59569), but the TypeScript team and other TypeScript users that are not used to this kind of formatting did *not* want to allow it. 

Funnily enough though, `true &&` and `false ||` expressions still work fine, just not `null ??`.

# Installation & Usage
This project is a [`typescript-girlboss`](https://github.com/ChiriVulpes/typescript-girlboss) plugin, which means compatibility with both the TypeScript Language Server and ts-patch are automatically handled, and configuration is a bit simpler.

1. Install via npm.
```bat
npm install typescript-ignore-leftmost-nullish-literal-errors --save-dev
```

You may need to also depend on `ts-patch` and `typescript-girlboss`:
```bat
npm install ts-patch --save-dev
npm install typescript-girlboss --save-dev
```

2. In your `tsconfig.json`, ensure `typescript-girlboss` is registered as a Language Server plugin and ts-patch program transformer plugin, and ensure that `typescript-ignore-leftmost-nullish-literal-errors` is registered as a typescript-girlboss plugin.
```json
{
	"compilerOptions": {
		// ...other options...
		"plugins": [
			{ 
				"name": "typescript-girlboss", 
				"plugins": [
					{ "name": "typescript-ignore-leftmost-nullish-literal-errors" },
				],
			},
			{ "transform": "typescript-girlboss/transform", "transformProgram": true },
		]
	}
}
```
